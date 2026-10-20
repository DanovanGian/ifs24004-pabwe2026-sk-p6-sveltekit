import { screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { fail, ok, renderWithProviders, submitForm, typeInto } from "../../../test-utils";
import { postCourse } from "../api/courseApi";
import AddModal from "./AddModal.svelte";

vi.mock("../api/courseApi");

async function fill(container: HTMLElement) {
  await typeInto(screen.getByLabelText("Judul"), "Kursus Baru");
  await typeInto(screen.getByLabelText("Deskripsi"), "Isi kursus");
  await submitForm(container);
}

describe("AddModal", () => {
  it("menyimpan kursus lalu memanggil onSaved dan onClose", async () => {
    vi.mocked(postCourse).mockResolvedValue(ok());
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const { container } = renderWithProviders(AddModal, { props: { onSaved, onClose } });
    await fill(container);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(postCourse).toHaveBeenCalledWith("Kursus Baru", "Isi kursus");
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("gagal: dialog error dan modal tetap terbuka", async () => {
    vi.mocked(postCourse).mockResolvedValue(fail("Judul wajib diisi"));
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const { container } = renderWithProviders(AddModal, { props: { onSaved, onClose } });
    await fill(container);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error" })),
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", () => {
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onSaved: vi.fn(), onClose } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
