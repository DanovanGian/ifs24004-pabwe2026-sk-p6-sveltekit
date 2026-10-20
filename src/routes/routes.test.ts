import { goto } from "$app/navigation";
import { screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { getContent, getCourse, getCourses } from "../features/courses/api/courseApi";
import { getUsers } from "../features/users/api/userApi";
import { makeContent, makeDetail, makeUser, ok, renderWithProviders } from "../test-utils";
import { ssr } from "./+layout";
import { fallback as apiProxy } from "./api/[...path]/+server";
import ErrorPage from "./+error.svelte";
import RootLayout from "./+layout.svelte";
import HomeRoute from "./+page.svelte";
import AuthLayoutRoute from "./auth/+layout.svelte";
import LoginRoute from "./auth/login/+page.svelte";
import RegisterRoute from "./auth/register/+page.svelte";
import DetailRoute from "./courses/[courseId]/+page.svelte";
import ContentRoute from "./courses/[courseId]/contents/[contentId]/+page.svelte";
import ProfileRoute from "./profile/+page.svelte";
import UsersRoute from "./users/+page.svelte";

vi.mock("../features/courses/api/courseApi");
vi.mock("../features/users/api/userApi");

const children = createRawSnippet(() => ({ render: () => "<p>isi rute</p>" }));
const session = { token: "t", profile: makeUser() };

describe("rute", () => {
  it("+layout.ts menonaktifkan SSR", () => {
    expect(ssr).toBe(false);
  });

  it("api/[...path]/+server.ts meneruskan permintaan ke proxy Delcom", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/courses?is_me=1");

    const response = await apiProxy({
      request,
      params: { path: "courses" },
      url: new URL(request.url),
    } as never);

    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/courses?is_me=1`);
    expect(response.status).toBe(200);
  });

  it("+layout.svelte: rute /auth merender anak langsung", () => {
    renderWithProviders(RootLayout, { path: "/auth/login", props: { children } });
    expect(screen.getByText("isi rute")).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });

  it("+layout.svelte: rute lain dibungkus CourseLayout", async () => {
    renderWithProviders(RootLayout, { path: "/", props: { children }, ...session });
    expect(screen.getByText("isi rute")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toBeInTheDocument();
  });

  it("+layout.svelte: tanpa sesi diarahkan ke halaman masuk", async () => {
    renderWithProviders(RootLayout, { path: "/", props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(screen.queryByText("isi rute")).not.toBeInTheDocument();
  });

  it("+page.svelte menampilkan daftar kursus", async () => {
    vi.mocked(getCourses).mockResolvedValue(ok({ courses: [] }));
    renderWithProviders(HomeRoute);
    expect(await screen.findByRole("heading", { name: "Semua Kursus" })).toBeInTheDocument();
  });

  it("+error.svelte menampilkan halaman 404", () => {
    renderWithProviders(ErrorPage);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("auth/+layout.svelte memakai AuthLayout", () => {
    renderWithProviders(AuthLayoutRoute, { props: { children } });
    expect(screen.getByText("isi rute")).toBeInTheDocument();
    expect(screen.getByText(/kumpulan kursus daring/i)).toBeInTheDocument();
  });

  it("halaman masuk dan daftar", () => {
    renderWithProviders(LoginRoute);
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    renderWithProviders(RegisterRoute);
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });

  it("courses/[courseId] membaca parameter rute", async () => {
    vi.mocked(getCourse).mockResolvedValue(ok({ course: makeDetail() }));
    renderWithProviders(DetailRoute, { ...session, params: { courseId: "10" } });
    expect(await screen.findByRole("heading", { name: "Belajar Svelte" })).toBeInTheDocument();
    expect(getCourse).toHaveBeenCalledWith("10");
  });

  it("courses/[courseId]/contents/[contentId] membaca parameter rute", async () => {
    vi.mocked(getContent).mockResolvedValue(ok({ course_content: makeContent() }));
    renderWithProviders(ContentRoute, { params: { courseId: "10", contentId: "100" } });
    expect(await screen.findByRole("heading", { name: "Pengantar" })).toBeInTheDocument();
    expect(getContent).toHaveBeenCalledWith("100");
  });

  it("halaman pengguna dan profil", async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [makeUser()] }));
    renderWithProviders(UsersRoute);
    expect(await screen.findByRole("heading", { name: "Pengguna" })).toBeInTheDocument();
    renderWithProviders(ProfileRoute, session);
    expect(screen.getByText("Ubah Kata Sandi", { selector: "h2" })).toBeInTheDocument();
  });
});
