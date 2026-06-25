import "dotenv/config";

const BASE_URL = "https://api.projectcor.com/v1";

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

interface LoginApiResponse {
  token: {
    access_token: string;
    type: string;
    refreshToken: string;
    expirationTime: string;
  };
  user: Record<string, unknown>;
}

class AuthService {
  private token: string | null = null;
  private expiresAt: number | null = null;
  private refreshToken: string | null = null;

  set(token: string, expiresIn?: number, refreshToken?: string): void {
    this.token = token;
    // Only apply the 60-second buffer if expires_in is meaningfully larger than the buffer.
    // If expires_in <= 60, treat as no expiry (null) rather than "already expired".
    this.expiresAt =
      expiresIn && expiresIn > 60 ? Date.now() + (expiresIn - 60) * 1000 : null;
    this.refreshToken = refreshToken ?? null;
  }

  isExpired(): boolean {
    return this.expiresAt !== null && Date.now() >= this.expiresAt;
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}

// Module-level singleton — all tool handlers in this process share this instance
const auth = new AuthService();

export function setSessionToken(token: string, expiresIn?: number, refreshToken?: string): void {
  auth.set(token, expiresIn, refreshToken);
}

async function refreshAccessToken(): Promise<void> {
  const refreshToken = auth.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available.");

  const response = await fetch(`${BASE_URL}/oauth/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "(unable to read response body)");
    throw new Error(
      `COR token refresh failed ${response.status} ${response.statusText}: ${errorBody}`
    );
  }

  const data = (await response.json()) as OAuthTokenResponse;
  auth.set(data.access_token, data.expires_in, data.refresh_token);
}

async function resolveToken(): Promise<string> {
  const token = auth.getToken();

  if (token && auth.isExpired() && auth.getRefreshToken()) {
    await refreshAccessToken();
    return auth.getToken()!;
  }

  if (token && !auth.isExpired()) return token;

  // Lazy client_credentials auth if env vars are present
  const apiKey = process.env.COR_API_KEY;
  const clientSecret = process.env.COR_CLIENT_SECRET;
  if (apiKey && clientSecret) {
    await getTokenViaClientCredentials(apiKey, clientSecret);
    return auth.getToken()!;
  }

  throw new Error(
    "Not authenticated. Set COR_API_KEY + COR_CLIENT_SECRET in your .env file, or call cor_login with your email and password."
  );
}

export async function getTokenViaClientCredentials(
  apiKey: string,
  clientSecret: string
): Promise<OAuthTokenResponse> {
  const credentials = Buffer.from(`${apiKey}:${clientSecret}`).toString("base64");

  const response = await fetch(`${BASE_URL}/oauth/token?grant_type=client_credentials`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "(unable to read response body)");
    throw new Error(
      `COR client_credentials auth failed ${response.status} ${response.statusText}: ${errorBody}`
    );
  }

  const data = (await response.json()) as OAuthTokenResponse;
  if (!data.access_token) {
    throw new Error(
      `COR client_credentials response missing access_token. Keys received: ${JSON.stringify(Object.keys(data))}`
    );
  }
  auth.set(data.access_token, data.expires_in, data.refresh_token);
  return data;
}

export async function corLogin(email: string, password: string): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({ email, password });

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "(unable to read response body)");
    throw new Error(`COR login failed ${response.status} ${response.statusText}: ${errorBody}`);
  }

  const raw = (await response.json()) as LoginApiResponse;

  if (!raw.token?.access_token) {
    throw new Error(
      `COR login response missing token.access_token. Keys received: ${JSON.stringify(Object.keys(raw))}`
    );
  }

  // Map the nested login response to OAuthTokenResponse shape
  const expiresInSeconds = raw.token.expirationTime
    ? Math.round((Number(raw.token.expirationTime) - Date.now()) / 1000)
    : undefined;

  const mapped: OAuthTokenResponse = {
    access_token: raw.token.access_token,
    token_type: raw.token.type,
    expires_in: expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : undefined,
    refresh_token: raw.token.refreshToken,
  };

  auth.set(mapped.access_token, mapped.expires_in, mapped.refresh_token);
  return mapped;
}

export async function corFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await resolveToken();
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorBody: string;
    try {
      errorBody = await response.text();
    } catch {
      errorBody = "(unable to read response body)";
    }
    throw new Error(`COR API ${response.status} ${response.statusText}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

export function buildQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : "";
}
