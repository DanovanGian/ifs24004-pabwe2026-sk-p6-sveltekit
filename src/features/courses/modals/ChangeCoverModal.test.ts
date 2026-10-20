import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { ok, renderWithProviders, submitForm } from "../../../test-utils";
import { postCover } from "../api/courseApi";
import ChangeCoverModal from "./ChangeCoverModal.svelte";

vi.mock("../api/courseApi");

describe("ChangeCoverModal", () => {
  it("memperingatkan bila berkas belum dipilih", async () => {
    const { container } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: 10, onSaved: vi.fn(), onClose: vi.fn() },
    });
    await submitForm(container);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" })),
    );
    expect(postCover).not.toHaveBeenCalled();
  });

  it("mengunggah sampul lalu memanggil onSaved dan onClose", async () => {
    vi.mocked(postCover).mockResolvedValue(ok());
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const { container } = renderWithProviders(ChangeCoverModal, {
      props: { courseId: 10, onSaved, onClose },
    });
    const file = new File(["x"], "sampul.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Berkas sampul"), { target: { files: [file] } });
    await submitForm(container);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(postCover).toHaveBeenCalledWith(10, file);
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("tombol Batal menutup modal", () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeCoverModal, { props: { courseId: 10, onSaved: vi.fn(), onClose } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
