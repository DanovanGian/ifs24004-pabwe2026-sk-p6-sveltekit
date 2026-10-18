import { describe, expect, it } from "vitest";
import { createRawSnippet, tick } from "svelte";
import { render, screen } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import {
  authProfile,
  authToken,
  isAuthenticated,
  isProfile,
} from "../../auth/states/authStore";
import { click, renderWithProviders } from "../../../test-utils";
import CourseLayout from "./CourseLayout.svelte";

const children = createRawSnippet(() => ({
  render: () => "<p>Isi halaman</p>",
}));

describe("CourseLayout", () => {
  it("menampilkan navbar, sidebar, dan isi halaman saat sudah login", () => {
    renderWithProviders(CourseLayout, { props: { children } });

    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
    expect(screen.getByText("Delcom Testing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengalihkan ke halaman masuk bila belum login", async () => {
    renderWithProviders(CourseLayout, { props: { children }, user: null });
    await tick();

    expect(goto).toHaveBeenCalledWith("/auth/login");
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(screen.queryByText("Isi halaman")).not.toBeInTheDocument();
  });

  it("menunggu selama profil dimuat, lalu mengalihkan bila token hilang", async () => {
    authToken.set("tok");
    authProfile.set(null);
    isAuthenticated.set(false);
    isProfile.set(true);
    render(CourseLayout, { props: { children } });
    await tick();

    // Profil sedang dimuat: belum ada pengalihan.
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();

    // Pemuatan selesai tetapi token masih ada: tetap belum ada pengalihan.
    isProfile.set(false);
    await tick();
    expect(goto).not.toHaveBeenCalled();

    // Token hilang: baru dialihkan.
    authToken.set(null);
    await tick();
    expect(goto).toHaveBeenCalledWith("/auth/login");
  });

  it("membuka dan menutup sidebar lewat tombol menu dan latar gelap", async () => {
    renderWithProviders(CourseLayout, { props: { children } });

    expect(screen.queryByLabelText("Tutup menu")).not.toBeInTheDocument();

    await click(screen.getByLabelText("Buka menu"));
    expect(screen.getByLabelText("Tutup menu")).toBeInTheDocument();

    await click(screen.getByLabelText("Tutup menu"));
    expect(screen.queryByLabelText("Tutup menu")).not.toBeInTheDocument();
  });
});
