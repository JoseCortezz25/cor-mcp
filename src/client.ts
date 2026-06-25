import "dotenv/config";

const BASE_URL = "https://api.projectcor.com/v1";

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;
let cachedRefreshToken: string | null = null;

export function setSessionToken(token: string, expiresIn?: number, refreshToken?: string): void {
  cachedToken = token;
  // Expire 60 s early to avoid edge-case clock skew
  tokenExpiresAt = expiresIn ? Date.now() + (expiresIn - 60) * 1000 : null;
  cachedRefreshToken = refreshToken ?? null;
}

function isTokenExpired(): boolean {
  return tokenExpiresAt !== null && Date.now() >= tokenExpiresAt;
}

async function refreshAccessToken(): Promise<void> {
  if (!cachedRefreshToken) throw new Error("No refresh token available.");

  const response = await fetch(`${BASE_URL}/oauth/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh_token: cachedRefreshToken }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "(unable to read response body)");
    throw new Error(`COR token refresh failed ${response.status} ${response.statusText}: ${errorBody}`);
  }

  const data = (await response.json()) as OAuthTokenResponse;
  setSessionToken(data.access_token, data.expires_in, data.refresh_token);
}

async function getToken(): Promise<string> {
  if (cachedToken && isTokenExpired() && cachedRefreshToken) {
    await refreshAccessToken();
  }

  if (cachedToken && !isTokenExpired()) return cachedToken;

  // Lazy client_credentials auth if env vars are present
  const apiKey = process.env.COR_API_KEY;
  const clientSecret = process.env.COR_CLIENT_SECRET;
  if (apiKey && clientSecret) {
    await getTokenViaClientCredentials(apiKey, clientSecret);
    return cachedToken!;
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
  setSessionToken(data.access_token, data.expires_in, data.refresh_token);
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

  const data = (await response.json()) as OAuthTokenResponse;
  setSessionToken(data.access_token, data.expires_in, data.refresh_token);
  return data;
}

export async function corFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
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
