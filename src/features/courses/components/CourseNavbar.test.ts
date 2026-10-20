import { screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { makeUser, renderWithProviders } from "../../../test-utils";
import CourseNavbar from "./CourseNavbar.svelte";

describe("CourseNavbar", () => {
  it("menampilkan profil serta memicu menu dan keluar", () => {
    const onToggleSidebar = vi.fn();
    const onLogout = vi.fn();
    renderWithProviders(CourseNavbar, {
      props: { profile: makeUser({ name: "Budi" }), onToggleSidebar, onLogout },
    });
    expect(screen.getByRole("link", { name: /Delcom Courses/ })).toHaveAttribute("href", "/");
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByAltText("Budi")).toBeInTheDocument();

    screen.getByRole("button", { name: "Buka menu" }).click();
    expect(onToggleSidebar).toHaveBeenCalledOnce();
    screen.getByRole("button", { name: "Keluar" }).click();
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
