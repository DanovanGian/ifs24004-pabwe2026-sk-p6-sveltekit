import { goto } from "$app/navigation";
import { waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { makeUser, ok, fail, renderWithProviders } from "../../../test-utils";
import { getMe } from "../../users/api/userApi";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";

vi.mock("../../users/api/userApi");

describe("AuthSessionRedirect", () => {
  it("tidak melakukan apa pun tanpa token", () => {
    renderWithProviders(AuthSessionRedirect);
    expect(getMe).not.toHaveBeenCalled();
    expect(goto).not.toHaveBeenCalled();
  });

  it("memuat profil dari token lama lalu pindah ke beranda", async () => {
    vi.mocked(getMe).mockResolvedValue(ok({ user: makeUser() }));
    renderWithProviders(AuthSessionRedirect, { token: "lama" });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(getMe).toHaveBeenCalledOnce();
  });

  it("tidak pindah bila token lama ditolak", async () => {
    vi.mocked(getMe).mockResolvedValue(fail("Unauthenticated."));
    renderWithProviders(AuthSessionRedirect, { token: "basi" });
    await waitFor(() => expect(getMe).toHaveBeenCalledOnce());
    expect(goto).not.toHaveBeenCalled();
  });

  it("langsung pindah bila token dan profil sudah siap", async () => {
    renderWithProviders(AuthSessionRedirect, { token: "t", profile: makeUser() });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(getMe).not.toHaveBeenCalled();
  });
});
