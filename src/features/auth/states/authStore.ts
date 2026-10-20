import { derived, writable } from "svelte/store";
import {
  getAccessToken,
  isSuccess,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import { withFlag } from "../../../helpers/storeHelper";
import { getMe } from "../../users/api/userApi";
import { postLogin, postRegister } from "../api/authApi";

export const authToken = writable<string | null>(getAccessToken());
export const authProfile = writable<User | null>(null);
export const isAuthLoading = writable(false);

export const isLogin = derived(authToken, ($token) => $token !== null);
export const isSessionReady = derived(
  [authToken, authProfile],
  ([$token, $profile]) => Boolean($token && $profile),
);

export function logout(): void {
  removeAccessToken();
  authToken.set(null);
  authProfile.set(null);
}

/** Memuat profil; bila token ditolak server, sesi dibersihkan. */
export async function loadProfile(): Promise<boolean> {
  const response = await getMe();
  if (isSuccess(response)) {
    authProfile.set(response.data.user);
    return true;
  }
  logout();
  return false;
}

export function login(email: string, password: string) {
  return withFlag(isAuthLoading, async () => {
    const response = await postLogin(email, password);
    if (isSuccess(response)) {
      putAccessToken(response.data.token);
      authToken.set(response.data.token);
      await loadProfile();
    }
    return response;
  });
}

export function register(name: string, email: string, password: string) {
  return withFlag(isAuthLoading, () => postRegister(name, email, password));
}
