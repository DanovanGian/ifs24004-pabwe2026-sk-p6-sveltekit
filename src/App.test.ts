import { describe, expect, it, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { screen, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import { renderWithProviders } from "./test-utils";

import { ssr } from "./routes/+layout";
import RootLayout from "./routes/+layout.svelte";
import ErrorPage from "./routes/+error.svelte";
import HomeRoute from "./routes/+page.svelte";
import AuthLayout from "./routes/auth/+layout.svelte";
import LoginRoute from "./routes/auth/login/+page.svelte";
import RegisterRoute from "./routes/auth/register/+page.svelte";
import CourseRoute from "./routes/courses/[courseId]/+page.svelte";
import ContentRoute from "./routes/courses/[courseId]/contents/[contentId]/+page.svelte";
import UsersRoute from "./routes/users/+page.svelte";
import ProfileRoute from "./routes/profile/+page.svelte";

// Rute hanyalah pembungkus tipis. Yang ditiru cukup lapisan API (jaringan), bukan store.
vi.mock("./index.css", () => ({}));

vi.mock("./features/courses/api/courseApi", () => {
  const content = {
    id: 9,
    course_id: 1,
    title: "Materi Contoh",
    youtube: "https://youtu.be/abc123",
    created_at: "2024-10-06T00:00:00.000000Z",
    updated_at: "2024-10-06T00:00:00.000000Z",
    my_status_finished: false,
  };
  return {
    courseApi: {
      getCourses: vi.fn().mockResolvedValue([]),
      getCourseById: vi.fn().mockResolvedValue({
        id: 1,
        user_id: 1,
        title: "Kursus Contoh",
        cover: null,
        description: "Deskripsi contoh",
        created_at: "2024-10-06T00:00:00.000000Z",
        updated_at: "2024-10-06T00:00:00.000000Z",
        author: { name: "Penulis", photo: "" },
        students: [],
        contents: [content],
        total_contents: 1,
        ratings: [],
        avg_ratings: null,
        my_percentage_finished: "0.00",
      }),
      getContentById: vi.fn().mockResolvedValue(content),
    },
  };
});

vi.mock("./features/users/api/userApi", () => ({
  userApi: {
    getUsers: vi.fn().mockResolvedValue([]),
    getProfile: vi.fn().mockResolvedValue({
      id: 1,
      name: "Delcom Testing",
      email: "testing@delcom.org",
      email_verified_at: null,
      photo: "",
      created_at: "2024-02-28T04:11:30.000000Z",
      updated_at: "2024-02-28T04:11:30.000000Z",
    }),
  },
}));

const children = createRawSnippet(() => ({
  render: () => "<p>Isi halaman</p>",
}));

describe("+layout.ts", () => {
  it("mematikan SSR karena store membaca localStorage", () => {
    expect(ssr).toBe(false);
  });
});

describe("+error.svelte", () => {
  it("menampilkan halaman tidak ditemukan", () => {
    renderWithProviders(ErrorPage);
    expect(screen.getByText("Halaman tidak ditemukan")).toBeInTheDocument();
  });
});

describe("+layout.svelte", () => {
  it("merender rute /auth tanpa layout kursus", () => {
    renderWithProviders(RootLayout, {
      props: { children },
      pathname: "/auth/login",
      user: null,
    });

    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(screen.queryByLabelText("Keluar")).not.toBeInTheDocument();
  });

  it("membungkus rute lain dengan layout kursus", async () => {
    renderWithProviders(RootLayout, { props: { children }, pathname: "/" });

    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(screen.getByLabelText("Keluar")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Delcom Testing")).toBeInTheDocument()
    );
  });
});

describe("rute /auth", () => {
  it("layout menampilkan identitas aplikasi dan isi halaman", () => {
    renderWithProviders(AuthLayout, { props: { children }, user: null });

    expect(
      screen.getByRole("heading", { name: "Delcom Courses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });

  it("layout mengalihkan pengguna yang sudah login ke beranda", async () => {
    renderWithProviders(AuthLayout, { props: { children } });

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("/auth/login menampilkan form masuk", () => {
    renderWithProviders(LoginRoute, { user: null });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/auth/register menampilkan form daftar", () => {
    renderWithProviders(RegisterRoute, { user: null });
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });
});

describe("rute halaman", () => {
  it("/ menampilkan daftar kursus", () => {
    renderWithProviders(HomeRoute);
    expect(
      screen.getByRole("heading", { name: "Semua Kursus" })
    ).toBeInTheDocument();
  });

  it("/courses/[courseId] menampilkan detail kursus", async () => {
    renderWithProviders(CourseRoute, { params: { courseId: "1" } });

    expect(
      await screen.findByRole("heading", { name: "Kursus Contoh" })
    ).toBeInTheDocument();
  });

  it("/courses/[courseId]/contents/[contentId] menampilkan materi", async () => {
    renderWithProviders(ContentRoute, {
      params: { courseId: "1", contentId: "9" },
    });

    expect(await screen.findByTitle("Materi Contoh")).toBeInTheDocument();
  });

  it("/users menampilkan direktori pengguna", async () => {
    renderWithProviders(UsersRoute);

    expect(await screen.findByText("Belum ada pengguna.")).toBeInTheDocument();
  });

  it("/profile menampilkan profil", () => {
    renderWithProviders(ProfileRoute);
    expect(screen.getByRole("heading", { name: "Profil" })).toBeInTheDocument();
  });
});
