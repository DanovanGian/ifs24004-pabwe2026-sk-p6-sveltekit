import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { click } from "../../../test-utils";
import { addCourse } from "../states/coursesStore";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import AddModal from "./AddModal.svelte";

vi.mock("../states/coursesStore", () => ({ addCourse: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const form = () => document.querySelector("form")!;

async function fill(title = "Belajar Svelte", description = "Dari nol") {
  await fireEvent.input(screen.getByLabelText("Judul"), {
    target: { value: title },
  });
  await fireEvent.input(screen.getByLabelText("Deskripsi"), {
    target: { value: description },
  });
}

beforeEach(() => {
  vi.mocked(addCourse).mockResolvedValue(undefined);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("AddModal", () => {
  it("tidak merender form saat tertutup", () => {
    render(AddModal, { props: { open: false } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menambah kursus tanpa sampul, lalu menutup modal dan mengosongkan form", async () => {
    const onclose = vi.fn();
    render(AddModal, { props: { open: true, onclose } });

    await fill();
    await fireEvent.change(screen.getByLabelText("Sampul (opsional)"));
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Kursus berhasil ditambahkan"
      )
    );
    expect(addCourse).toHaveBeenCalledWith(
      { title: "Belajar Svelte", description: "Dari nol" },
      null
    );
    expect(onclose).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
  });

  it("menambah kursus dengan sampul dan menampilkan status menyimpan", async () => {
    let resolveAdd!: () => void;
    vi.mocked(addCourse).mockReturnValue(
      new Promise<void>((resolve) => (resolveAdd = resolve))
    );
    render(AddModal, { props: { open: true } });
    const file = new File(["x"], "cover.png", { type: "image/png" });

    await fill();
    await fireEvent.change(screen.getByLabelText("Sampul (opsional)"), {
      target: { files: [file] },
    });
    await fireEvent.submit(form());

    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    resolveAdd();

    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
    expect(addCourse).toHaveBeenCalledWith(
      { title: "Belajar Svelte", description: "Dari nol" },
      file
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error dan tidak menutup modal bila gagal", async () => {
    vi.mocked(addCourse).mockRejectedValue(new Error("Judul sudah ada"));
    const onclose = vi.fn();
    render(AddModal, { props: { open: true, onclose } });

    await fill();
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Judul sudah ada")
    );
    expect(onclose).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Judul")).toHaveValue("Belajar Svelte");
  });

  it("tombol Batal memanggil onclose", async () => {
    const onclose = vi.fn();
    render(AddModal, { props: { open: true, onclose } });

    await click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("aman dipakai tanpa onclose (nilai bawaan)", async () => {
    render(AddModal, { props: { open: true } });

    await click(screen.getByRole("button", { name: "Batal" }));
    await fill();
    await fireEvent.submit(form());

    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
  });
});
