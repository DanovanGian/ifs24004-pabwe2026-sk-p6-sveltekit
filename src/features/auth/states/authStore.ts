import { writable, get } from "svelte/store";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import { userApi, type User } from "../../users/api/userApi";

const initialToken = getAccessToken();

export const authToken = writable<string | null>(initialToken);
export const isAuthenticated = writable<boolean>(false);
export const authProfile = writable<User | null>(null);
// true selama profil masih dimuat; false setelah selesai (berhasil atau gagal)
export const isProfile = writable<boolean>(initialToken !== null);

export function setIsProfile(value: boolean): void {
  isProfile.set(value);
}

export function setAuthLogin(token: string, profile: User): void {
  putAccessToken(token);
  authToken.set(token);
  authProfile.set(profile);
  isAuthenticated.set(true);
  isProfile.set(false);
}

export function setAuthLogout(): void {
  removeAccessToken();
  authToken.set(null);
  authProfile.set(null);
  isAuthenticated.set(false);
  isProfile.set(false);
}

// Dipanggil saat aplikasi dibuka: kalau ada token tersimpan, ambil profilnya.
export async function loadSession(): Promise<void> {
  if (!get(authToken)) {
    isProfile.set(false);
    return;
  }

  isProfile.set(true);
  try {
    const profile = await userApi.getProfile();
    authProfile.set(profile);
    isAuthenticated.set(true);
  } catch {
    setAuthLogout();
    return;
  }
  isProfile.set(false);
}
