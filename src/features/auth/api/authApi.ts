import { apiHelper } from "../../../helpers/apiHelper";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiHelper("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<LoginResult> {
    const response = await apiHelper<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data as LoginResult;
  },

  logout() {
    return apiHelper("/auth/logout", { method: "POST" });
  },
};
