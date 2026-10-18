import { describe, expect, it } from "vitest";
import { tick } from "svelte";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { renderWithProviders, mockUser } from "../../../test-utils";
import {
  authProfile,
  authToken,
  isAuthenticated,
  isProfile,
} from "../states/authStore";

describe("AuthSessionRedirect", () => {
  it("mengalihkan ke beranda bila sesi sudah siap", async () => {
    renderWithProviders(AuthSessionRedirect);
    await tick();

    expect(goto).toHaveBeenCalledWith("/");
  });

  it("tidak mengalihkan bila belum login", async () => {
    renderWithProviders(AuthSessionRedirect, { user: null });
    await tick();

    expect(goto).not.toHaveBeenCalled();
  });

  it("baru mengalihkan setelah token, status login, profil, dan pemuatan selesai", async () => {
    renderWithProviders(AuthSessionRedirect, { user: null });

    authToken.set("tok");
    await tick();
    expect(goto).not.toHaveBeenCalled();

    isAuthenticated.set(true);
    await tick();
    expect(goto).not.toHaveBeenCalled();

    authProfile.set(mockUser);
    isProfile.set(true);
    await tick();
    expect(goto).not.toHaveBeenCalled();

    isProfile.set(false);
    await tick();
    expect(goto).toHaveBeenCalledWith("/");
  });
});
