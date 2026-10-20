import { screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import CourseSidebar from "./CourseSidebar.svelte";

describe("CourseSidebar", () => {
  it("menampilkan tiga menu dan menandai yang aktif", () => {
    renderWithProviders(CourseSidebar, { props: { open: false, currentPath: "/users", onClose: vi.fn() } });
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveClass("bg-indigo-50");
    expect(screen.getByRole("link", { name: "Profil" })).not.toHaveClass("bg-indigo-50");
  });

  it("tersembunyi di layar kecil saat tertutup dan terbuka saat open", () => {
    const closed = renderWithProviders(CourseSidebar, { props: { open: false, currentPath: "/", onClose: vi.fn() } });
    expect(closed.container.querySelector("aside")).toHaveClass("hidden");
    closed.unmount();
    const opened = renderWithProviders(CourseSidebar, { props: { open: true, currentPath: "/", onClose: vi.fn() } });
    expect(opened.container.querySelector("aside")).not.toHaveClass("hidden");
  });

  it("memanggil onClose saat menu diklik", () => {
    const onClose = vi.fn();
    renderWithProviders(CourseSidebar, { props: { open: true, currentPath: "/", onClose } });
    screen.getByRole("link", { name: "Profil" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
