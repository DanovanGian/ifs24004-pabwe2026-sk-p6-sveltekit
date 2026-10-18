import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/svelte";
import NotFoundPage from "./NotFoundPage.svelte";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404 dan tautan ke beranda", () => {
    render(NotFoundPage);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman tidak ditemukan")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Kembali ke beranda" })
    ).toHaveAttribute("href", "/");
  });
});
