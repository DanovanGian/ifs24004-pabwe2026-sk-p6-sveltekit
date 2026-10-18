import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import {
  authProfile,
  authToken,
  isAuthenticated,
  isProfile,
  loadSession,
  setAuthLogin,
  setAuthLogout,
  setIsProfile,
} from "./authStore";
import { userApi } from "../../users/api/userApi";
import { mockUser } from "../../../test-utils";

vi.mock("../../users/api/userApi", () => ({
  userApi: { getProfile: vi.fn() },
}));

beforeEach(() => {
  setAuthLogout();
});

describe("keadaan awal", () => {
  it("isProfile bernilai true bila ada token tersimpan", async () => {
    localStorage.setItem("token", "abc");
    vi.resetModules();
    const fresh = await import("./authStore");

    expect(get(fresh.authToken)).toBe("abc");
    expect(get(fresh.isProfile)).toBe(true);
  });

  it("isProfile bernilai false bila tidak ada token", async () => {
    vi.resetModules();
    const fresh = await import("./authStore");

    expect(get(fresh.authToken)).toBeNull();
    expect(get(fresh.isProfile)).toBe(false);
  });
});

describe("aksi", () => {
  it("setIsProfile mengubah status pemuatan profil", () => {
    setIsProfile(true);
    expect(get(isProfile)).toBe(true);
    setIsProfile(false);
    expect(get(isProfile)).toBe(false);
  });

  it("setAuthLogin menyimpan token dan mengisi state", () => {
    setAuthLogin("tok", mockUser);

    expect(localStorage.getItem("token")).toBe("tok");
    expect(get(authToken)).toBe("tok");
    expect(get(authProfile)).toBe(mockUser);
    expect(get(isAuthenticated)).toBe(true);
    expect(get(isProfile)).toBe(false);
  });

  it("setAuthLogout menghapus token dan mengosongkan state", () => {
    setAuthLogin("tok", mockUser);
    setAuthLogout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(get(authToken)).toBeNull();
    expect(get(authProfile)).toBeNull();
    expect(get(isAuthenticated)).toBe(false);
    expect(get(isProfile)).toBe(false);
  });
});

describe("loadSession", () => {
  it("tidak memanggil API bila tidak ada token", async () => {
    isProfile.set(true);

    await loadSession();

    expect(userApi.getProfile).not.toHaveBeenCalled();
    expect(get(isProfile)).toBe(false);
  });

  it("mengisi profil dan status login bila token valid", async () => {
    authToken.set("tok");
    vi.mocked(userApi.getProfile).mockResolvedValue(mockUser);

    await loadSession();

    expect(get(authProfile)).toBe(mockUser);
    expect(get(isAuthenticated)).toBe(true);
    expect(get(isProfile)).toBe(false);
  });

  it("logout otomatis bila profil gagal dimuat", async () => {
    localStorage.setItem("token", "kedaluwarsa");
    authToken.set("kedaluwarsa");
    vi.mocked(userApi.getProfile).mockRejectedValue(new Error("401"));

    await loadSession();

    expect(localStorage.getItem("token")).toBeNull();
    expect(get(authToken)).toBeNull();
    expect(get(isAuthenticated)).toBe(false);
    expect(get(isProfile)).toBe(false);
  });
});
