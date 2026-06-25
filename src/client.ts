import "dotenv/config";

const BASE_URL = "https://api.projectcor.com/v1";

let sessionToken: string | null = null;

export function setSessionToken(token: string): void {
  sessionToken = token;
}

function getToken(): string {
  if (process.env.COR_API_TOKEN) return process.env.COR_API_TOKEN;
  if (sessionToken) return sessionToken;
  throw new Error(
    "Not authenticated. Call cor_login with your email and password first, or set COR_API_TOKEN in your .env file."
  );
}

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export async function corLogin(email: string, password: string): Promise<OAuthTokenResponse> {
  const response = await fetch(`${BASE_URL}/oauth/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorBody: string;
    try {
      errorBody = await response.text();
    } catch {
      errorBody = "(unable to read response body)";
    }
    throw new Error(`COR login failed ${response.status} ${response.statusText}: ${errorBody}`);
  }

  const data = (await response.json()) as OAuthTokenResponse;
  setSessionToken(data.access_token);
  return data;
}

export async function corFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
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
    throw new Error(
      `COR API ${response.status} ${response.statusText}: ${errorBody}`
    );
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
