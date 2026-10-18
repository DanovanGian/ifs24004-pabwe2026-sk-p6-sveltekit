import { render } from "@testing-library/svelte";
import { page } from "$app/state";
import {
  authProfile,
  authToken,
  isAuthenticated,
  isProfile,
} from "./features/auth/states/authStore";
import type { User } from "./features/users/api/userApi";

export const mockUser: User = {
  id: 1,
  name: "Delcom Testing",
  email: "testing@delcom.org",
  email_verified_at: null,
  photo: "img/profile/1_1709107233.png",
  created_at: "2024-02-28T04:11:30.000000Z",
  updated_at: "2024-02-28T04:11:30.000000Z",
};

interface RenderOptions {
  props?: Record<string, any>;
  pathname?: string;
  params?: Record<string, string>;
  user?: User | null; // null = belum login
}

// "Provider" di aplikasi ini adalah state global: store auth dan objek page.
export function renderWithProviders(
  Component: any,
  { props = {}, pathname = "/", params = {}, user = mockUser }: RenderOptions = {}
) {
  (page as any).url = new URL(pathname, "http://localhost");
  (page as any).params = params;

  if (user) {
    authToken.set("test-token");
    authProfile.set(user);
    isAuthenticated.set(true);
    isProfile.set(false);
  } else {
    authToken.set(null);
    authProfile.set(null);
    isAuthenticated.set(false);
    isProfile.set(false);
  }

  return render(Component, { props });
}
