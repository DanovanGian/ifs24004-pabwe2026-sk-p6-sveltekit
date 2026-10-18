import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { click } from "../../../test-utils";
import { changeCover } from "../states/coursesStore";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import ChangeCoverModal from "./ChangeCoverModal.svelte";

vi.mock("../states/coursesStore", () => ({ changeCover: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const form = () => document.querySelector("form")!;
const fileInput = () => screen.getByLabelText("Berkas sampul");
const file = new File(["x"], "cover.png", { type: "image/png" });

beforeEach(() => {
  // jsdom tidak menyediakan URL.createObjectURL.
  URL.createObjectURL = vi.fn(() => "blob:pratinjau");
  vi.mocked(changeCover).mockResolvedValue(undefined);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("ChangeCoverModal", () => {
  it("tidak merender form saat tertutup", () => {
    render(ChangeCoverModal, { props: { open: false, courseId: 5 } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tombol unggah nonaktif dan belum ada pratinjau sebelum memilih berkas", () => {
    render(ChangeCoverModal, { props: { open: true, courseId: 5 } });

    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
    expect(screen.queryByAltText("Pratinjau sampul")).not.toBeInTheDocument();
  });

  it("menampilkan pratinjau setelah memilih berkas, dan menghapusnya bila dikosongkan", async () => {
    render(ChangeCoverModal, { props: { open: true, courseId: 5 } });

    await fireEvent.change(fileInput(), { target: { files: [file] } });
    expect(screen.getByAltText("Pratinjau sampul")).toHaveAttribute(
      "src",
      "blob:pratinjau"
    );
    expect(screen.getByRole("button", { name: "Unggah" })).toBeEnabled();

    await fireEvent.change(fileInput(), { target: { files: [] } });
    expect(screen.queryByAltText("Pratinjau sampul")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah" })).toBeDisabled();
  });

  it("tidak mengunggah bila form dikirim tanpa berkas", async () => {
    render(ChangeCoverModal, { props: { open: true, courseId: 5 } });

    await fireEvent.submit(form());

    expect(changeCover).not.toHaveBeenCalled();
  });

  it("mengunggah sampul, menutup modal, dan membersihkan pratinjau", async () => {
    let resolveUpload!: () => void;
    vi.mocked(changeCover).mockReturnValue(
      new Promise<void>((resolve) => (resolveUpload = resolve))
    );
    const onclose = vi.fn();
    render(ChangeCoverModal, { props: { open: true, courseId: 5, onclose } });

    await fireEvent.change(fileInput(), { target: { files: [file] } });
    await fireEvent.submit(form());
    expect(screen.getByRole("button", { name: "Mengunggah..." })).toBeDisabled();

    resolveUpload();
    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Sampul kursus berhasil diubah"
      )
    );
    expect(changeCover).toHaveBeenCalledWith(5, file);
    expect(onclose).toHaveBeenCalledTimes(1);
    expect(screen.queryByAltText("Pratinjau sampul")).not.toBeInTheDocument();
  });

  it("menampilkan pesan error bila unggahan gagal", async () => {
    vi.mocked(changeCover).mockRejectedValue(new Error("Berkas terlalu besar"));
    const onclose = vi.fn();
    render(ChangeCoverModal, { props: { open: true, courseId: 5, onclose } });

    await fireEvent.change(fileInput(), { target: { files: [file] } });
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Berkas terlalu besar")
    );
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tombol Batal memanggil onclose, dan aman tanpa onclose (nilai bawaan)", async () => {
    const onclose = vi.fn();
    const { unmount } = render(ChangeCoverModal, {
      props: { open: true, courseId: 5, onclose },
    });
    await click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
    unmount();

    render(ChangeCoverModal, { props: { open: true, courseId: 5 } });
    await click(screen.getByRole("button", { name: "Batal" }));
    await fireEvent.change(fileInput(), { target: { files: [file] } });
    await fireEvent.submit(form());
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
  });
});
