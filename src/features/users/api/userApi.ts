import { apiHelper } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  photo: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const userApi = {
  async getUsers(): Promise<User[]> {
    const response = await apiHelper<{ users: User[] }>("/users");
    return response.data!.users;
  },

  async getUserById(id: number | string): Promise<User> {
    const response = await apiHelper<{ user: User }>(`/users/${id}`);
    return response.data!.user;
  },

  async getProfile(): Promise<User> {
    const response = await apiHelper<{ user: User }>("/users/me");
    return response.data!.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiHelper<{ user: User }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data!.user;
  },

  // Harus POST (bukan PUT) agar file terbaca di sisi server.
  changePhoto(photo: File) {
    const formData = new FormData();
    formData.append("photo", photo);
    return apiHelper("/users/me/photo", { method: "POST", body: formData });
  },

  changePassword(payload: ChangePasswordPayload) {
    return apiHelper("/users/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
