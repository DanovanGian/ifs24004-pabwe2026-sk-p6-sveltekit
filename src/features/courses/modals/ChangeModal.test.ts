import { screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { makeCourse, ok, renderWithProviders, submitForm, typeInto } from "../../../test-utils";
import { putCourse } from "../api/courseApi";
import ChangeModal from "./ChangeModal.svelte";

vi.mock("../api/courseApi");

describe("ChangeModal", () => {
  it("terisi data kursus dan menyimpan perubahan", async () => {
    vi.mocked(putCourse).mockResolvedValue(ok());
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const { container } = renderWithProviders(ChangeModal, {
      props: { course: makeCourse(), onSaved, onClose },
    });
    expect(screen.getByLabelText("Judul")).toHaveValue("Belajar Svelte");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Dasar-dasar Svelte");

    await typeInto(screen.getByLabelText("Judul"), "Judul Baru");
    await submitForm(container);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(putCourse).toHaveBeenCalledWith(10, "Judul Baru", "Dasar-dasar Svelte");
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("tombol Batal menutup modal", () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeModal, { props: { course: makeCourse(), onSaved: vi.fn(), onClose } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
