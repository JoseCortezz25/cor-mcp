import "dotenv/config";

const BASE_URL = "https://api.projectcor.com/v1";

function getToken(): string {
  const token = process.env.COR_API_TOKEN;
  if (!token) {
    throw new Error(
      "COR_API_TOKEN is not set. Add it to your .env file (see env.example)."
    );
  }
  return token;
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
