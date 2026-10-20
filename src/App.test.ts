import { get } from "svelte/store";
import { describe, expect, it, vi } from "vitest";
import { authProfile, authToken, login, logout } from "./features/auth/states/authStore";
import { loadCourses, courses } from "./features/courses/states/coursesStore";
import { makeCourse, makeUser, resetStores } from "./test-utils";

/** Alur lengkap melalui fetch palsu: login -> token -> profil -> daftar kursus. */
describe("alur aplikasi (API dengan fetch palsu)", () => {
  it("login menyimpan token, memuat profil, lalu permintaan berikutnya memakai Bearer token", async () => {
    resetStores();
    const fetchMock = vi.fn(async (url: string) => {
      const json = (body: unknown) => ({ json: async () => body });
      if (url.endsWith("/auth/login")) {
        return json({ status: "success", message: "ok", data: { token: "tok-9", user: makeUser() } });
      }
      if (url.endsWith("/users/me")) {
        return json({ status: "success", message: "ok", data: { user: makeUser() } });
      }
      return json({ status: "success", message: "ok", data: { courses: [makeCourse()] } });
    });
    vi.stubGlobal("fetch", fetchMock);

    await login("budi@del.ac.id", "rahasia");
    expect(get(authToken)).toBe("tok-9");
    expect(get(authProfile)?.name).toBe("Budi");

    await loadCourses(true);
    expect(get(courses)).toHaveLength(1);
    const [url, init] = fetchMock.mock.calls.at(-1) as unknown as [string, RequestInit];
    expect(url).toBe("/api/courses?is_me=1");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-9");

    logout();
    expect(get(authToken)).toBeNull();
  });
});
