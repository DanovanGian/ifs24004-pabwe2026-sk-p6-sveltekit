import { goto } from "$app/navigation";
import { screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { get } from "svelte/store";
import { describe, expect, it, vi } from "vitest";
import { fail, makeUser, ok, renderWithProviders } from "../../../test-utils";
import { getMe } from "../../users/api/userApi";
import { authToken } from "../../auth/states/authStore";
import CourseLayout from "./CourseLayout.svelte";

vi.mock("../../users/api/userApi");

const children = createRawSnippet(() => ({ render: () => "<p>konten halaman</p>" }));

describe("CourseLayout", () => {
  it("tanpa token: pindah ke halaman masuk", async () => {
    renderWithProviders(CourseLayout, { props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(screen.queryByText("konten halaman")).not.toBeInTheDocument();
  });

  it("dengan token tanpa profil: memuat profil lalu menampilkan konten", async () => {
    vi.mocked(getMe).mockResolvedValue(ok({ user: makeUser() }));
    renderWithProviders(CourseLayout, { token: "t", props: { children } });
    expect(await screen.findByText("konten halaman")).toBeInTheDocument();
    expect(getMe).toHaveBeenCalledOnce();
    expect(goto).not.toHaveBeenCalled();
  });

  it("token ditolak: sesi dibersihkan dan pindah ke halaman masuk", async () => {
    vi.mocked(getMe).mockResolvedValue(fail("Unauthenticated."));
    renderWithProviders(CourseLayout, { token: "basi", props: { children } });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(get(authToken)).toBeNull();
  });

  it("profil siap: sidebar bisa dibuka/ditutup dan logout mengarahkan ke masuk", async () => {
    const { container } = renderWithProviders(CourseLayout, {
      token: "t",
      profile: makeUser(),
      path: "/users",
      props: { children },
    });
    expect(getMe).not.toHaveBeenCalled();
    expect(screen.getByText("konten halaman")).toBeInTheDocument();

    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("hidden");
    screen.getByRole("button", { name: "Buka menu" }).click();
    await waitFor(() => expect(aside).not.toHaveClass("hidden"));
    screen.getByRole("link", { name: "Profil" }).click();
    await waitFor(() => expect(aside).toHaveClass("hidden"));

    screen.getByRole("button", { name: "Keluar" }).click();
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(screen.queryByText("konten halaman")).not.toBeInTheDocument();
  });
});
