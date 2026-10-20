import { screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { makeContent, ok, renderWithProviders, submitForm, typeInto } from "../../../test-utils";
import { postContent, putContent } from "../api/courseApi";
import ContentModal from "./ContentModal.svelte";

vi.mock("../api/courseApi");

describe("ContentModal", () => {
  it("mode tambah: formulir kosong dan memanggil postContent", async () => {
    vi.mocked(postContent).mockResolvedValue(ok());
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const { container } = renderWithProviders(ContentModal, {
      props: { courseId: 10, content: null, onSaved, onClose },
    });
    expect(screen.getByRole("dialog", { name: "Tambah Materi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("");

    await typeInto(screen.getByLabelText("Judul"), "Materi 1");
    await typeInto(screen.getByLabelText("Tautan YouTube"), "https://youtu.be/dQw4w9WgXcQ");
    await submitForm(container);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(postContent).toHaveBeenCalledWith(10, "Materi 1", "https://youtu.be/dQw4w9WgXcQ");
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("mode ubah: terisi data materi dan memanggil putContent", async () => {
    vi.mocked(putContent).mockResolvedValue(ok());
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const content = makeContent();
    const { container } = renderWithProviders(ContentModal, {
      props: { courseId: 10, content, onSaved, onClose },
    });
    expect(screen.getByRole("dialog", { name: "Ubah Materi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Pengantar");
    expect(screen.getByLabelText("Tautan YouTube")).toHaveValue(content.youtube);

    await submitForm(container);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(putContent).toHaveBeenCalledWith(100, "Pengantar", content.youtube);
  });

  it("tombol Batal menutup modal", () => {
    const onClose = vi.fn();
    renderWithProviders(ContentModal, {
      props: { courseId: 10, content: null, onSaved: vi.fn(), onClose },
    });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
