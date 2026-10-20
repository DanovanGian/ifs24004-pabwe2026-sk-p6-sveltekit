import { beforeEach, describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import {
  changeRating,
  courseDetail,
  deleteContent,
  deleteCourse,
  fetchCourseDetail,
  joinCourse,
  leaveCourse,
  resetMutationFlags,
} from "../states/coursesStore";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  click,
  makeContent,
  makeCourseDetail,
  mockUser,
  renderWithProviders,
} from "../../../test-utils";
import DetailPage from "./DetailPage.svelte";

// Store diganti writable sungguhan, fungsinya ditiru. Modal anak ikut memakai store ini.
vi.mock("../states/coursesStore", async () => {
  const { writable } = await import("svelte/store");
  return {
    courseDetail: writable(null),
    fetchCourseDetail: vi.fn(),
    deleteCourse: vi.fn(),
    joinCourse: vi.fn(),
    leaveCourse: vi.fn(),
    changeRating: vi.fn(),
    deleteContent: vi.fn(),
    resetMutationFlags: vi.fn(),
    updateCourse: vi.fn(),
    changeCover: vi.fn(),
    addContent: vi.fn(),
    updateContent: vi.fn(),
  };
});

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return {
    ...actual,
    showConfirmDialog: vi.fn(),
    showErrorDialog: vi.fn(),
    showSuccessDialog: vi.fn(),
  };
});

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => (resolve = res));
  return { promise, resolve };
}

// mockUser.id = 1. Pengunjung: bukan pemilik, bukan peserta.
const asOwner = () => makeCourseDetail({ user_id: 1 });
const asStudent = () => makeCourseDetail({ students: [1, 3] });

function renderDetail(
  detail = makeCourseDetail(),
  user: typeof mockUser | null = mockUser
) {
  courseDetail.set(detail);
  return renderWithProviders(DetailPage, { params: { courseId: "1" }, user });
}

beforeEach(() => {
  courseDetail.set(null);
  vi.mocked(fetchCourseDetail).mockResolvedValue(undefined as any);
  for (const fn of [deleteCourse, joinCourse, leaveCourse, changeRating, deleteContent]) {
    vi.mocked(fn).mockResolvedValue(undefined as any);
  }
  vi.mocked(showConfirmDialog).mockResolvedValue(true);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("DetailPage - pemuatan", () => {
  it("memuat detail kursus saat dibuka", () => {
    renderWithProviders(DetailPage, { params: { courseId: "1" } });

    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
    expect(resetMutationFlags).toHaveBeenCalled();
    expect(fetchCourseDetail).toHaveBeenCalledWith("1");
    expect(screen.getByRole("link", { name: "Semua Kursus" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("menampilkan pesan bila pemuatan gagal", async () => {
    vi.mocked(fetchCourseDetail).mockRejectedValue(new Error("Kursus tidak ada"));
    renderWithProviders(DetailPage, { params: { courseId: "1" } });

    expect(await screen.findByText("Kursus tidak ada")).toBeInTheDocument();
  });

  it("mengabaikan detail kursus lain yang tersisa di store", () => {
    renderDetail(makeCourseDetail({ id: 99 }));

    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
    expect(screen.queryByText("Belajar ReactJS")).not.toBeInTheDocument();
  });
});

describe("DetailPage - tampilan", () => {
  it("menampilkan data kursus", () => {
    renderDetail();

    expect(screen.getByText("Belajar ReactJS")).toBeInTheDocument();
    expect(screen.getByText("Belajar ReactJS dari awal")).toBeInTheDocument();
    expect(screen.getByText("Abdullah Ubaid")).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
    expect(screen.getByText("2 peserta")).toBeInTheDocument();
    expect(screen.getByText("3 materi")).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();
    expect(screen.getByAltText("Belajar ReactJS")).toBeInTheDocument();
  });

  it("menampilkan pengganti bila tanpa sampul", () => {
    renderDetail(makeCourseDetail({ cover: null }));

    expect(screen.queryByAltText("Belajar ReactJS")).not.toBeInTheDocument();
  });

  it("beralih ke pengganti saat sampul gagal dimuat", async () => {
    renderDetail();

    await fireEvent.error(screen.getByAltText("Belajar ReactJS"));

    expect(screen.queryByAltText("Belajar ReactJS")).not.toBeInTheDocument();
  });

  it("menampilkan tanda hubung bila belum ada rating rata-rata", () => {
    renderDetail(makeCourseDetail({ avg_ratings: null, ratings: [] }));

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating.")).toBeInTheDocument();
  });

  it("menampilkan daftar rating", () => {
    renderDetail();

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Keren")).toBeInTheDocument();
  });

  it("menampilkan pesan bila belum ada materi", () => {
    renderDetail(makeCourseDetail({ contents: [], total_contents: 0 }));

    expect(
      screen.getByText("Belum ada materi pada kursus ini.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Ikuti kursus ini untuk membuka materi.")
    ).not.toBeInTheDocument();
  });

  it("menandai materi yang sudah selesai", () => {
    renderDetail(
      makeCourseDetail({
        contents: [makeContent({ my_status_finished: true })],
      })
    );

    expect(screen.getByTitle("Selesai")).toBeInTheDocument();
  });
});

describe("DetailPage - pengunjung", () => {
  it("melihat tombol ikuti, tanpa tombol pemilik atau peserta", () => {
    renderDetail();

    expect(screen.getByRole("button", { name: "Ikuti kursus" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ubah" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hapus" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Keluar kursus" })).not.toBeInTheDocument();
    expect(screen.queryByText("Progres belajarmu")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Tulis ulasanmu...")).not.toBeInTheDocument();
  });

  it("belum bisa membuka materi dan mendapat catatan", () => {
    renderDetail();

    expect(screen.getByText("1. Dasar Java")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Dasar Java/ })).not.toBeInTheDocument();
    expect(
      screen.getByText("Ikuti kursus ini untuk membuka materi.")
    ).toBeInTheDocument();
  });

  it("tanpa profil juga diperlakukan sebagai pengunjung", () => {
    renderDetail(makeCourseDetail(), null);

    expect(screen.getByRole("button", { name: "Ikuti kursus" })).toBeInTheDocument();
  });

  it("mengikuti kursus", async () => {
    renderDetail();

    await click(screen.getByRole("button", { name: "Ikuti kursus" }));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengikuti kursus")
    );
    expect(joinCourse).toHaveBeenCalledWith("1");
  });

  it("menonaktifkan tombol selama proses berjalan", async () => {
    const pending = deferred();
    vi.mocked(joinCourse).mockReturnValue(pending.promise as any);
    renderDetail();

    await click(screen.getByRole("button", { name: "Ikuti kursus" }));
    expect(screen.getByRole("button", { name: "Ikuti kursus" })).toBeDisabled();

    pending.resolve();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Ikuti kursus" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila gagal mengikuti", async () => {
    vi.mocked(joinCourse).mockRejectedValue(new Error("Gagal mengikuti"));
    renderDetail();

    await click(screen.getByRole("button", { name: "Ikuti kursus" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengikuti")
    );
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });
});

describe("DetailPage - peserta", () => {
  it("melihat tombol keluar, progres, tautan materi, dan form rating", () => {
    renderDetail(asStudent());

    expect(screen.getByRole("button", { name: "Keluar kursus" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ikuti kursus" })).not.toBeInTheDocument();
    expect(screen.getByText("Progres belajarmu")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dasar Java/ })).toHaveAttribute(
      "href",
      "/courses/1/contents/9"
    );
    expect(screen.getByPlaceholderText("Tulis ulasanmu...")).toBeInTheDocument();
  });

  it("tidak keluar bila konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderDetail(asStudent());

    await click(screen.getByRole("button", { name: "Keluar kursus" }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(leaveCourse).not.toHaveBeenCalled();
  });

  it("keluar dari kursus bila dikonfirmasi", async () => {
    renderDetail(asStudent());

    await click(screen.getByRole("button", { name: "Keluar kursus" }));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil keluar dari kursus")
    );
    expect(leaveCourse).toHaveBeenCalledWith("1");
  });

  it("bintang bawaan 5, lalu bisa diganti", async () => {
    renderDetail(asStudent());

    expect(screen.getByRole("radio", { name: "5 bintang" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    await click(screen.getByRole("radio", { name: "3 bintang" }));
    expect(screen.getByRole("radio", { name: "3 bintang" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("radio", { name: "5 bintang" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("mengirim rating dengan bintang dan komentar yang dipilih", async () => {
    renderDetail(asStudent());
    const comment = screen.getByPlaceholderText("Tulis ulasanmu...");

    await click(screen.getByRole("radio", { name: "3 bintang" }));
    await fireEvent.input(comment, { target: { value: "Bagus" } });
    await fireEvent.submit(comment.closest("form")!);

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Rating berhasil disimpan")
    );
    expect(changeRating).toHaveBeenCalledWith("1", { ratings: 3, comment: "Bagus" });
  });

  it("menampilkan pesan error bila rating gagal disimpan", async () => {
    vi.mocked(changeRating).mockRejectedValue(new Error("Gagal rating"));
    renderDetail(asStudent());
    const comment = screen.getByPlaceholderText("Tulis ulasanmu...");

    await fireEvent.submit(comment.closest("form")!);

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal rating")
    );
  });
});

describe("DetailPage - pemilik", () => {
  it("melihat tombol pemilik dan tidak melihat tombol ikuti atau keluar", () => {
    renderDetail(asOwner());

    expect(screen.getByRole("button", { name: "Ganti sampul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ubah" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah materi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Ubah konten")).toBeInTheDocument();
    expect(screen.getByLabelText("Hapus konten")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ikuti kursus" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Keluar kursus" })).not.toBeInTheDocument();
  });

  it("antarmuka pemilik didahulukan bila pengguna juga tercatat sebagai peserta", () => {
    renderDetail(makeCourseDetail({ user_id: 1, students: [1] }));

    expect(screen.getByRole("button", { name: "Ubah" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Keluar kursus" })).not.toBeInTheDocument();
    expect(screen.queryByText("Progres belajarmu")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Tulis ulasanmu...")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dasar Java/ })).toBeInTheDocument();
  });

  it("membuka dan menutup modal ubah data", async () => {
    renderDetail(asOwner());

    await click(screen.getByRole("button", { name: "Ubah" }));
    expect(screen.getByRole("dialog", { name: "Ubah Data Kursus" })).toBeInTheDocument();

    await click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("membuka dan menutup modal ganti sampul", async () => {
    renderDetail(asOwner());

    await click(screen.getByRole("button", { name: "Ganti sampul" }));
    expect(screen.getByRole("dialog", { name: "Ganti Sampul" })).toBeInTheDocument();

    await click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("membuka modal konten untuk mengubah, lalu untuk menambah dengan form kosong", async () => {
    renderDetail(asOwner());

    await click(screen.getByLabelText("Ubah konten"));
    expect(screen.getByRole("dialog", { name: "Ubah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("Dasar Java");

    await click(screen.getByRole("button", { name: "Batal" }));
    await click(screen.getByRole("button", { name: "Tambah materi" }));

    expect(screen.getByRole("dialog", { name: "Tambah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("");
  });

  it("tidak menghapus kursus bila konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderDetail(asOwner());

    await click(screen.getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(deleteCourse).not.toHaveBeenCalled();
    expect(goto).not.toHaveBeenCalled();
  });

  it("menghapus kursus lalu kembali ke beranda", async () => {
    renderDetail(asOwner());

    await click(screen.getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(deleteCourse).toHaveBeenCalledWith(1);
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error bila penghapusan kursus gagal", async () => {
    vi.mocked(deleteCourse).mockRejectedValue(new Error("Gagal menghapus"));
    renderDetail(asOwner());

    await click(screen.getByRole("button", { name: "Hapus" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal menghapus")
    );
    expect(goto).not.toHaveBeenCalled();
  });

  it("tidak melakukan apa-apa bila detail hilang sebelum tombol hapus diproses", async () => {
    renderDetail(asOwner());
    const button = screen.getByRole("button", { name: "Hapus" });

    // $derived selalu dihitung ulang saat dibaca, jadi handler langsung melihat detail = null.
    courseDetail.set(null);
    button.click();
    await tick();

    expect(showConfirmDialog).not.toHaveBeenCalled();
  });

  it("tidak menghapus materi bila konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderDetail(asOwner());

    await click(screen.getByLabelText("Hapus konten"));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(deleteContent).not.toHaveBeenCalled();
  });

  it("menghapus materi bila dikonfirmasi", async () => {
    renderDetail(asOwner());

    await click(screen.getByLabelText("Hapus konten"));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Konten berhasil dihapus")
    );
    expect(deleteContent).toHaveBeenCalledWith("1", 9);
  });

  it("menampilkan pesan error bila penghapusan materi gagal", async () => {
    vi.mocked(deleteContent).mockRejectedValue(new Error("Gagal hapus materi"));
    renderDetail(asOwner());

    await click(screen.getByLabelText("Hapus konten"));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus materi")
    );
  });
});

import { addContent, changeCover } from "../states/coursesStore";

describe("DetailPage - modal sampul dan konten", () => {
  it("mengunggah sampul dari modal ganti sampul", async () => {
    URL.createObjectURL = vi.fn(() => "blob:pratinjau");
    renderDetail(asOwner());
    const file = new File(["x"], "cover.png", { type: "image/png" });

    await click(screen.getByRole("button", { name: "Ganti sampul" }));
    await fireEvent.change(screen.getByLabelText("Berkas sampul"), {
      target: { files: [file] },
    });
    await fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);

    await waitFor(() => expect(changeCover).toHaveBeenCalledWith(1, file));
  });

  it("menambah materi dari modal konten", async () => {
    renderDetail(asOwner());

    await click(screen.getByRole("button", { name: "Tambah materi" }));
    await fireEvent.input(screen.getByLabelText("Judul materi"), {
      target: { value: "Materi baru" },
    });
    await fireEvent.input(screen.getByLabelText("Tautan YouTube"), {
      target: { value: "https://youtu.be/xyz" },
    });
    await fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);

    await waitFor(() =>
      expect(addContent).toHaveBeenCalledWith(1, {
        title: "Materi baru",
        youtube: "https://youtu.be/xyz",
      })
    );
  });
});
