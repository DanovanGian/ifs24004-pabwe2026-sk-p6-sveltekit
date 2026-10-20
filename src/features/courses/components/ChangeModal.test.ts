import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { click, makeCourseDetail } from "../../../test-utils";
import { updateCourse } from "../states/coursesStore";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import ChangeModal from "./ChangeModal.svelte";

vi.mock("../states/coursesStore", () => ({ updateCourse: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const course = makeCourseDetail({ id: 5, title: "Lama", description: "Deskripsi lama" });
const form = () => document.querySelector("form")!;

beforeEach(() => {
  vi.mocked(updateCourse).mockResolvedValue(undefined);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("ChangeModal", () => {
  it("tidak merender form saat tertutup", () => {
    render(ChangeModal, { props: { open: false, course } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mengisi form dengan data kursus saat dibuka", async () => {
    const { rerender } = render(ChangeModal, { props: { open: false, course } });

    await rerender({ open: true });

    expect(screen.getByLabelText("Judul")).toHaveValue("Lama");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Deskripsi lama");
  });

  it("menyimpan perubahan, menutup modal, dan menampilkan dialog sukses", async () => {
    const onclose = vi.fn();
    render(ChangeModal, { props: { open: true, course, onclose } });

    await fireEvent.input(screen.getByLabelText("Judul"), {
      target: { value: "Baru" },
    });
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Data kursus berhasil diubah"
      )
    );
    expect(updateCourse).toHaveBeenCalledWith(5, {
      title: "Baru",
      description: "Deskripsi lama",
    });
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status menyimpan selama proses berjalan", async () => {
    let resolveUpdate!: () => void;
    vi.mocked(updateCourse).mockReturnValue(
      new Promise<void>((resolve) => (resolveUpdate = resolve))
    );
    render(ChangeModal, { props: { open: true, course } });

    await fireEvent.submit(form());
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    resolveUpdate();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila gagal", async () => {
    vi.mocked(updateCourse).mockRejectedValue(new Error("Gagal mengubah"));
    const onclose = vi.fn();
    render(ChangeModal, { props: { open: true, course, onclose } });

    await fireEvent.submit(form());

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengubah")
    );
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tombol Batal memanggil onclose, dan aman tanpa onclose (nilai bawaan)", async () => {
    const onclose = vi.fn();
    const { unmount } = render(ChangeModal, {
      props: { open: true, course, onclose },
    });
    await click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalledTimes(1);
    unmount();

    render(ChangeModal, { props: { open: true, course } });
    await click(screen.getByRole("button", { name: "Batal" }));
    await fireEvent.submit(form());
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
  });
});

describe("ChangeModal - deskripsi", () => {
  it("mengirim deskripsi yang diubah", async () => {
    render(ChangeModal, { props: { open: true, course } });

    await fireEvent.input(screen.getByLabelText("Deskripsi"), {
      target: { value: "Deskripsi baru" },
    });
    await fireEvent.submit(form());

    await waitFor(() =>
      expect(updateCourse).toHaveBeenCalledWith(5, {
        title: "Lama",
        description: "Deskripsi baru",
      })
    );
  });
});
