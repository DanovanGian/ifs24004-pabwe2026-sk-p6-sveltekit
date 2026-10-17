const TOKEN_KEY = "token";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiResponse<T = any> {
  status: "success" | "fail";
  message: string;
  data?: T;
}

export async function apiHelper<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Untuk FormData (upload sampul), biarkan browser mengisi Content-Type sendiri.
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${DELCOM_BASEURL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok || result.status === "fail") {
    throw new Error(result.message || "Terjadi kesalahan pada server");
  }

  return result;
}
