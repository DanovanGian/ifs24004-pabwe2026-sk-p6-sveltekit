import { describe, expect, it, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { click } from "../../../test-utils";
import Modal from "./Modal.svelte";

const children = createRawSnippet(() => ({
  render: () => "<p>Isi modal</p>",
}));

describe("Modal", () => {
  it("tidak merender apa pun saat tertutup", () => {
    render(Modal, { props: { open: false, title: "Judul", children } });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menampilkan judul dan isi saat terbuka", () => {
    render(Modal, { props: { open: true, title: "Judul", children } });

    expect(screen.getByRole("dialog", { name: "Judul" })).toBeInTheDocument();
    expect(screen.getByText("Isi modal")).toBeInTheDocument();
  });

  it("memanggil onclose lewat latar belakang dan tombol X", async () => {
    const onclose = vi.fn();
    render(Modal, { props: { open: true, title: "Judul", children, onclose } });

    const [backdrop, closeButton] = screen.getAllByRole("button", {
      name: "Tutup",
    });
    await click(backdrop);
    await click(closeButton);

    expect(onclose).toHaveBeenCalledTimes(2);
  });

  it("memanggil onclose saat tombol Escape ditekan", async () => {
    const onclose = vi.fn();
    render(Modal, { props: { open: true, title: "Judul", children, onclose } });

    await fireEvent.keyDown(window, { key: "Escape" });
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("mengabaikan tombol lain", async () => {
    const onclose = vi.fn();
    render(Modal, { props: { open: true, title: "Judul", children, onclose } });

    await fireEvent.keyDown(window, { key: "Enter" });
    expect(onclose).not.toHaveBeenCalled();
  });

  it("mengabaikan Escape saat modal tertutup", async () => {
    const onclose = vi.fn();
    render(Modal, { props: { open: false, title: "Judul", children, onclose } });

    await fireEvent.keyDown(window, { key: "Escape" });
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tetap aman dipakai tanpa onclose (nilai bawaan)", async () => {
    render(Modal, { props: { open: true, title: "Judul", children } });

    const [backdrop, closeButton] = screen.getAllByRole("button", {
      name: "Tutup",
    });
    await click(backdrop);
    await click(closeButton);
    await fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
