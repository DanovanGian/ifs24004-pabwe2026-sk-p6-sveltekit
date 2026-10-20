import { screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.svelte";

describe("AuthLayout", () => {
  it("menampilkan teks pengenal kursus dan anak layout", () => {
    const children = createRawSnippet(() => ({ render: () => "<p>isi halaman</p>" }));
    renderWithProviders(AuthLayout, { props: { children } });
    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByText(/kumpulan kursus daring/i)).toBeInTheDocument();
    expect(screen.getAllByText("Delcom Courses").length).toBeGreaterThan(0);
  });
});
