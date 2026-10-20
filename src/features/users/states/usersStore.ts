import { writable } from "svelte/store";
import { isSuccess } from "../../../helpers/apiHelper";
import { withFlag } from "../../../helpers/storeHelper";
import { authProfile, loadProfile } from "../../auth/states/authStore";
import { getUsers, postPhoto, putMe, putPassword } from "../api/userApi";

export const users = writable<User[]>([]);
export const isUsersLoading = writable(false);
export const isProfileSaving = writable(false);
export const isPhotoSaving = writable(false);
export const isPasswordSaving = writable(false);

export function loadUsers() {
  return withFlag(isUsersLoading, async () => {
    const response = await getUsers();
    if (isSuccess(response)) {
      users.set(response.data.users);
    }
    return response;
  });
}

export function updateProfile(name: string, email: string) {
  return withFlag(isProfileSaving, async () => {
    const response = await putMe(name, email);
    if (isSuccess(response)) {
      authProfile.set(response.data.user);
    }
    return response;
  });
}

export function updatePhoto(file: File) {
  return withFlag(isPhotoSaving, async () => {
    const response = await postPhoto(file);
    if (isSuccess(response)) {
      await loadProfile();
    }
    return response;
  });
}

export function updatePassword(
  password: string,
  newPassword: string,
  confirmation: string,
) {
  return withFlag(isPasswordSaving, () =>
    putPassword(password, newPassword, confirmation),
  );
}
