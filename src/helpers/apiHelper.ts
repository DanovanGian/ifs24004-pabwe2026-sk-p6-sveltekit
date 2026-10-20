const TOKEN_KEY = "access_token";

// Permintaan dikirim ke proxy same-origin (src/routes/api/[...path]/+server.ts),
// bukan langsung ke Delcom Open API, sehingga browser tidak melakukan CORS.
export const API_PATH = "/api";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isSuccess(response: ApiResponse): boolean {
  return response.status === "success";
}

/**
 * Pembungkus fetch ke Delcom Open API (lewat proxy same-origin `/api`).
 * - header `Authorization: Bearer <token>` dipasang bila token tersedia
 * - FormData dikirim apa adanya, objek lain dikirim sebagai JSON
 * - kegagalan jaringan diubah menjadi respons `fail`
 */
export async function apiRequest<T = any>(
  method: string,
  path: string,
  payload?: FormData | object,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: FormData | string | undefined;
  if (payload instanceof FormData) {
    body = payload;
  } else if (payload) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(`${API_PATH}${path}`, {
      method,
      headers,
      body,
    });
    return await response.json();
  } catch {
    return { status: "fail", message: "Tidak dapat terhubung ke server." };
  }
}
