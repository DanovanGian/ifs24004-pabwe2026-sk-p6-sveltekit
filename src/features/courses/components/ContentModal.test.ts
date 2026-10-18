import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { click, makeContent } from "../../../test-utils";
import { addContent, updateContent } from "../states/coursesStore";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import ContentModal from "./ContentModal.svelte";

vi.mock("../states/coursesStore", () => ({
  addContent: vi.fn(),
  updateContent: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const form = () => document.querySelector("form")!;
const content = makeContent({ id: 9, title: "Materi lama", youtube: "https://youtu.be/lama" });

beforeEach(() => {
  vi.mocked(addContent).mockResolvedValue(undefined);
  vi.mocked(updateContent).mockResolvedValue(undefined);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("ContentModal - tambah", () => {
  it("tidak merender form saat tertutup", () => {
    render(ContentModal, { props: { open: false, courseId: 5 } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menampilkan form kosong berjudul 'Tambah Konten'", () => {
    render(ContentModal, { props: { open: true, courseId: 5 } });

    expect(screen.getByRole("dialog", { name: "Tambah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("");
    expect(screen.getByLabelText("Tautan YouTube")).toHaveValue("");
  });

  it("menambah konten lalu menutup modal", async () => {
    const onclose = vi.fn();
    render(ContentModal, { props: { open: true, courseId: 5, onclose } });

    await fireEvent.input(screen.getByLabelText("Judul materi"), {
      target: { value: "Pengantar" },
    });
    await fireEvent.input(screen.getByLabelText("Tautan YouTube"), {
      target: { value: "https://youtu.be/abc" },
    });
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Konten berhasil ditambahkan"
      )
    );
    expect(addContent).toHaveBeenCalledWith(5, {
      title: "Pengantar",
      youtube: "https://youtu.be/abc",
    });
    expect(updateContent).not.toHaveBeenCalled();
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});

describe("ContentModal - ubah", () => {
  it("mengisi form dengan konten yang diubah dan berjudul 'Ubah Konten'", () => {
    render(ContentModal, { props: { open: true, courseId: 5, content } });

    expect(screen.getByRole("dialog", { name: "Ubah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("Materi lama");
    expect(screen.getByLabelText("Tautan YouTube")).toHaveValue(
      "https://youtu.be/lama"
    );
  });

  it("menyimpan perubahan lewat updateContent", async () => {
    const onclose = vi.fn();
    render(ContentModal, { props: { open: true, courseId: 5, content, onclose } });

    await fireEvent.input(screen.getByLabelText("Judul materi"), {
      target: { value: "Materi baru" },
    });
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Konten berhasil diubah")
    );
    expect(updateContent).toHaveBeenCalledWith(5, 9, {
      title: "Materi baru",
      youtube: "https://youtu.be/lama",
    });
    expect(addContent).not.toHaveBeenCalled();
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});

describe("ContentModal - umum", () => {
  it("mengisi ulang form saat modal dibuka kembali", async () => {
    const { rerender } = render(ContentModal, {
      props: { open: false, courseId: 5, content },
    });

    await rerender({ open: true });

    expect(screen.getByLabelText("Judul materi")).toHaveValue("Materi lama");
  });

  it("menampilkan status menyimpan selama proses berjalan", async () => {
    let resolveAdd!: () => void;
    vi.mocked(addContent).mockReturnValue(
      new Promise<void>((resolve) => (resolveAdd = resolve))
    );
    render(ContentModal, { props: { open: true, courseId: 5 } });

    await fireEvent.submit(form());
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    resolveAdd();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila gagal", async () => {
    vi.mocked(addContent).mockRejectedValue(new Error("Tautan tidak valid"));
    const onclose = vi.fn();
    render(ContentModal, { props: { open: true, courseId: 5, onclose } });

    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Tautan tidak valid")
    );
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tombol Batal memanggil onclose, dan aman tanpa onclose (nilai bawaan)", async () => {
    const onclose = vi.fn();
    const { unmount } = render(ContentModal, {
      props: { open: true, courseId: 5, onclose },
    });
    await click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
    unmount();

    render(ContentModal, { props: { open: true, courseId: 5 } });
    await click(screen.getByRole("button", { name: "Batal" }));
    await fireEvent.submit(form());
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
  });
});
