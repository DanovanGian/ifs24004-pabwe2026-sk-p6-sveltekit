import { screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import ModalShell from "./ModalShell.svelte";

describe("ModalShell", () => {
  it("menampilkan judul, isi, dan menutup lewat tombol", () => {
    const onClose = vi.fn();
    const children = createRawSnippet(() => ({ render: () => "<p>isi modal</p>" }));
    renderWithProviders(ModalShell, { props: { title: "Judul Modal", onClose, children } });
    expect(screen.getByRole("dialog", { name: "Judul Modal" })).toBeInTheDocument();
    expect(screen.getByText("isi modal")).toBeInTheDocument();
    screen.getByRole("button", { name: "Tutup" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
