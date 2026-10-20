import { apiRequest } from "../../../helpers/apiHelper";

export function postLogin(email: string, password: string) {
  return apiRequest<{ user: User; token: string }>("POST", "/auth/login", {
    email,
    password,
  });
}

export function postRegister(name: string, email: string, password: string) {
  return apiRequest("POST", "/auth/register", { name, email, password });
}
