import { screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.svelte";

describe("NotFoundPage", () => {
  it("menampilkan 404 dan tautan ke beranda", () => {
    renderWithProviders(NotFoundPage);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke Beranda" })).toHaveAttribute("href", "/");
  });
});
