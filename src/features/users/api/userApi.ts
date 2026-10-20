import { apiRequest } from "../../../helpers/apiHelper";

export function getUsers() {
  return apiRequest<{ users: User[] }>("GET", "/users");
}

export function getMe() {
  return apiRequest<{ user: User }>("GET", "/users/me");
}

export function putMe(name: string, email: string) {
  return apiRequest<{ user: User }>("PUT", "/users/me", { name, email });
}

export function postPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  return apiRequest("POST", "/users/me/photo", form);
}

export function putPassword(
  password: string,
  newPassword: string,
  confirmation: string,
) {
  return apiRequest("PUT", "/users/password", {
    password,
    new_password: newPassword,
    new_password_confirmation: confirmation,
  });
}
