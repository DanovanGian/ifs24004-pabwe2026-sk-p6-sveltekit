import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { fail, makeUser, ok } from "../../../test-utils";
import { getMe } from "../../users/api/userApi";
import { postLogin, postRegister } from "../api/authApi";
import {
  authProfile,
  authToken,
  isAuthLoading,
  isLogin,
  isSessionReady,
  loadProfile,
  login,
  logout,
  register,
} from "./authStore";

vi.mock("../api/authApi");
vi.mock("../../users/api/userApi");

beforeEach(() => {
  authToken.set(null);
  authProfile.set(null);
});

describe("status sesi", () => {
  it("isLogin mengikuti token", () => {
    expect(get(isLogin)).toBe(false);
    authToken.set("t");
    expect(get(isLogin)).toBe(true);
  });

  it("isSessionReady butuh token dan profil", () => {
    expect(get(isSessionReady)).toBe(false);
    authToken.set("t");
    expect(get(isSessionReady)).toBe(false);
    authProfile.set(makeUser());
    expect(get(isSessionReady)).toBe(true);
  });
});

describe("logout", () => {
  it("menghapus token dan profil", () => {
    putAccessToken("t");
    authToken.set("t");
    authProfile.set(makeUser());
    logout();
    expect(getAccessToken()).toBeNull();
    expect(get(authToken)).toBeNull();
    expect(get(authProfile)).toBeNull();
  });
});

describe("loadProfile", () => {
  it("mengisi profil bila berhasil", async () => {
    vi.mocked(getMe).mockResolvedValue(ok({ user: makeUser() }));
    expect(await loadProfile()).toBe(true);
    expect(get(authProfile)).toEqual(makeUser());
  });

  it("logout bila token ditolak", async () => {
    authToken.set("basi");
    vi.mocked(getMe).mockResolvedValue(fail("Unauthenticated."));
    expect(await loadProfile()).toBe(false);
    expect(get(authToken)).toBeNull();
  });
});

describe("login", () => {
  it("menyimpan token lalu memuat profil", async () => {
    let loadingDuringRequest = false;
    vi.mocked(postLogin).mockImplementation(async () => {
      loadingDuringRequest = get(isAuthLoading);
      return ok({ token: "tok-1", user: makeUser() });
    });
    vi.mocked(getMe).mockResolvedValue(ok({ user: makeUser() }));

    const response = await login("budi@del.ac.id", "rahasia");

    expect(response.status).toBe("success");
    expect(loadingDuringRequest).toBe(true);
    expect(get(isAuthLoading)).toBe(false);
    expect(getAccessToken()).toBe("tok-1");
    expect(get(authToken)).toBe("tok-1");
    expect(get(authProfile)).toEqual(makeUser());
  });

  it("tidak menyimpan token saat gagal", async () => {
    vi.mocked(postLogin).mockResolvedValue(fail("Email atau kata sandi salah"));
    const response = await login("a", "b");
    expect(response.status).toBe("fail");
    expect(get(authToken)).toBeNull();
    expect(getMe).not.toHaveBeenCalled();
  });
});

describe("register", () => {
  it("meneruskan respons API dan menurunkan bendera", async () => {
    vi.mocked(postRegister).mockResolvedValue(ok(undefined, "Terdaftar"));
    const response = await register("Budi", "b@d.id", "rahasia");
    expect(response.message).toBe("Terdaftar");
    expect(postRegister).toHaveBeenCalledWith("Budi", "b@d.id", "rahasia");
    expect(get(isAuthLoading)).toBe(false);
  });
});
