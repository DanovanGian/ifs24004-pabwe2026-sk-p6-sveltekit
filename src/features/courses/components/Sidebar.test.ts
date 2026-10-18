import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/svelte";
import { click, renderWithProviders } from "../../../test-utils";
import Sidebar from "./Sidebar.svelte";

// jsdom tidak mendukung navigasi; cegah klik pada <a> memicu galat "not implemented".
const blockNavigation = (event: Event) => event.preventDefault();
beforeEach(() => document.addEventListener("click", blockNavigation));
afterEach(() => document.removeEventListener("click", blockNavigation));

describe("Sidebar", () => {
  it("menampilkan tiga menu", () => {
    renderWithProviders(Sidebar);

    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute(
      "href",
      "/users"
    );
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("menandai Semua Kursus aktif di beranda dan di halaman kursus", () => {
    renderWithProviders(Sidebar, { pathname: "/" });
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveClass(
      "bg-indigo-50"
    );
  });

  it("menandai Semua Kursus aktif di rute /courses/...", () => {
    renderWithProviders(Sidebar, { pathname: "/courses/5/contents/9" });
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveClass(
      "bg-indigo-50"
    );
  });

  it("menandai menu Pengguna aktif dan Semua Kursus tidak aktif", () => {
    renderWithProviders(Sidebar, { pathname: "/users" });

    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveClass(
      "bg-indigo-50"
    );
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveClass(
      "text-slate-600"
    );
  });

  it("menandai menu Profil aktif", () => {
    renderWithProviders(Sidebar, { pathname: "/profile" });
    expect(screen.getByRole("link", { name: "Profil" })).toHaveClass(
      "bg-indigo-50"
    );
  });

  it("tersembunyi dan tanpa latar gelap saat open=false", () => {
    const { container } = renderWithProviders(Sidebar, { props: { open: false } });

    expect(container.querySelector("aside")).toHaveClass("-translate-x-full");
    expect(screen.queryByLabelText("Tutup menu")).not.toBeInTheDocument();
  });

  it("terlihat dengan latar gelap saat open=true", () => {
    const { container } = renderWithProviders(Sidebar, { props: { open: true } });

    expect(container.querySelector("aside")).toHaveClass("translate-x-0");
    expect(screen.getByLabelText("Tutup menu")).toBeInTheDocument();
  });

  it("memanggil onclose saat latar gelap atau tautan diklik", async () => {
    const onclose = vi.fn();
    renderWithProviders(Sidebar, { props: { open: true, onclose } });

    await click(screen.getByLabelText("Tutup menu"));
    await click(screen.getByRole("link", { name: "Pengguna" }));

    expect(onclose).toHaveBeenCalledTimes(2);
  });

  it("aman dipakai tanpa onclose (nilai bawaan)", async () => {
    renderWithProviders(Sidebar, { props: { open: true } });

    await click(screen.getByLabelText("Tutup menu"));
    await click(screen.getByRole("link", { name: "Profil" }));

    expect(screen.getByRole("link", { name: "Profil" })).toBeInTheDocument();
  });
});
