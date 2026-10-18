import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import {
  courses,
  deleteAllCourses,
  deleteCourse,
  fetchCourses,
  isCoursesLoading,
  resetMutationFlags,
} from "../states/coursesStore";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { click, makeCourse, renderWithProviders } from "../../../test-utils";
import HomePage from "./HomePage.svelte";

// Store diganti writable sungguhan agar tes bisa mengisi data, fungsinya ditiru.
vi.mock("../states/coursesStore", async () => {
  const { writable } = await import("svelte/store");
  return {
    courses: writable([]),
    isCoursesLoading: writable(false),
    fetchCourses: vi.fn(),
    deleteCourse: vi.fn(),
    deleteAllCourses: vi.fn(),
    resetMutationFlags: vi.fn(),
    addCourse: vi.fn(), // dipakai AddModal
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

// mockUser.id = 1, jadi "mine" milik pengguna yang login.
const mine = makeCourse({ id: 1, user_id: 1, title: "Kursus Saya" });
const other = makeCourse({
  id: 2,
  user_id: 2,
  title: "Kursus Orang",
  description: "Tentang Python",
  author: { name: "Budi Santoso", photo: "" },
});

const searchBox = () =>
  screen.getByPlaceholderText("Cari judul, deskripsi, atau penulis...");

beforeEach(() => {
  courses.set([]);
  isCoursesLoading.set(false);
  vi.mocked(fetchCourses).mockResolvedValue(undefined);
  vi.mocked(deleteCourse).mockResolvedValue(undefined);
  vi.mocked(deleteAllCourses).mockResolvedValue(undefined);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("HomePage - memuat data", () => {
  it("mereset bendera dan memuat semua kursus saat dibuka", () => {
    renderWithProviders(HomePage);

    expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
    expect(resetMutationFlags).toHaveBeenCalledTimes(1);
    expect(fetchCourses).toHaveBeenCalledWith(false);
  });

  it("menampilkan pesan error bila pemuatan gagal", async () => {
    vi.mocked(fetchCourses).mockRejectedValue(new Error("Gagal memuat"));
    renderWithProviders(HomePage);

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat")
    );
  });

  it("menampilkan teks memuat saat daftar masih kosong", () => {
    isCoursesLoading.set(true);
    renderWithProviders(HomePage);

    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("tetap menampilkan kartu saat memuat ulang dan daftar sudah terisi", () => {
    courses.set([mine]);
    isCoursesLoading.set(true);
    renderWithProviders(HomePage);

    expect(screen.queryByText("Memuat data...")).not.toBeInTheDocument();
    expect(screen.getByText("Kursus Saya")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila tidak ada kursus", () => {
    renderWithProviders(HomePage);

    expect(
      screen.getByText("Tidak ada kursus yang ditemukan.")
    ).toBeInTheDocument();
  });
});

describe("HomePage - daftar dan pencarian", () => {
  beforeEach(() => courses.set([mine, other]));

  it("menampilkan semua kartu, tombol hapus hanya pada milik sendiri", () => {
    renderWithProviders(HomePage);

    expect(screen.getByText("Kursus Saya")).toBeInTheDocument();
    expect(screen.getByText("Kursus Orang")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Hapus kursus")).toHaveLength(1);
  });

  it("tanpa profil, tidak ada kursus yang dianggap milik sendiri", () => {
    renderWithProviders(HomePage, { user: null });

    expect(screen.queryByLabelText("Hapus kursus")).not.toBeInTheDocument();
  });

  it("menyaring berdasarkan judul", async () => {
    renderWithProviders(HomePage);

    await fireEvent.input(searchBox(), { target: { value: "saya" } });

    expect(screen.getByText("Kursus Saya")).toBeInTheDocument();
    expect(screen.queryByText("Kursus Orang")).not.toBeInTheDocument();
  });

  it("menyaring berdasarkan deskripsi", async () => {
    renderWithProviders(HomePage);

    await fireEvent.input(searchBox(), { target: { value: "reactjs" } });

    expect(screen.getByText("Kursus Saya")).toBeInTheDocument();
    expect(screen.queryByText("Kursus Orang")).not.toBeInTheDocument();
  });

  it("menyaring berdasarkan nama penulis", async () => {
    renderWithProviders(HomePage);

    await fireEvent.input(searchBox(), { target: { value: "santoso" } });

    expect(screen.getByText("Kursus Orang")).toBeInTheDocument();
    expect(screen.queryByText("Kursus Saya")).not.toBeInTheDocument();
  });

  it("menampilkan semua kursus bila kata kunci hanya spasi", async () => {
    renderWithProviders(HomePage);

    await fireEvent.input(searchBox(), { target: { value: "   " } });

    expect(screen.getByText("Kursus Saya")).toBeInTheDocument();
    expect(screen.getByText("Kursus Orang")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila tidak ada yang cocok", async () => {
    renderWithProviders(HomePage);

    await fireEvent.input(searchBox(), { target: { value: "zzz" } });

    expect(
      screen.getByText("Tidak ada kursus yang ditemukan.")
    ).toBeInTheDocument();
  });
});

describe("HomePage - filter milik saya", () => {
  it("memuat ulang dengan filter saat dicentang dan tanpa filter saat dilepas", async () => {
    renderWithProviders(HomePage);
    const checkbox = screen.getByLabelText("Milik saya");

    await click(checkbox);
    expect(fetchCourses).toHaveBeenLastCalledWith(true);

    await click(checkbox);
    expect(fetchCourses).toHaveBeenLastCalledWith(false);
  });

  it("menampilkan tombol hapus semua hanya saat filter aktif dan ada kursus milik sendiri", async () => {
    courses.set([mine, other]);
    renderWithProviders(HomePage);

    expect(
      screen.queryByRole("button", { name: /Hapus semua milik saya/ })
    ).not.toBeInTheDocument();

    await click(screen.getByLabelText("Milik saya"));
    expect(
      screen.getByRole("button", { name: /Hapus semua milik saya/ })
    ).toBeInTheDocument();
  });

  it("menyembunyikan tombol hapus semua bila tidak ada kursus milik sendiri", async () => {
    courses.set([other]);
    renderWithProviders(HomePage);

    await click(screen.getByLabelText("Milik saya"));

    expect(
      screen.queryByRole("button", { name: /Hapus semua milik saya/ })
    ).not.toBeInTheDocument();
  });
});

describe("HomePage - menghapus", () => {
  beforeEach(() => courses.set([mine]));

  it("tidak menghapus kursus bila konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderWithProviders(HomePage);

    await click(screen.getByLabelText("Hapus kursus"));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(deleteCourse).not.toHaveBeenCalled();
  });

  it("menghapus kursus bila dikonfirmasi", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    renderWithProviders(HomePage);

    await click(screen.getByLabelText("Hapus kursus"));

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Kursus berhasil dihapus")
    );
    expect(deleteCourse).toHaveBeenCalledWith(1);
  });

  it("menampilkan pesan error bila penghapusan gagal", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteCourse).mockRejectedValue(new Error("Gagal menghapus"));
    renderWithProviders(HomePage);

    await click(screen.getByLabelText("Hapus kursus"));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal menghapus")
    );
  });

  async function openDeleteAll() {
    await click(screen.getByLabelText("Milik saya"));
    await click(screen.getByRole("button", { name: /Hapus semua milik saya/ }));
  }

  it("tidak menghapus semua bila konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderWithProviders(HomePage);

    await openDeleteAll();

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(deleteAllCourses).not.toHaveBeenCalled();
  });

  it("menghapus semua kursus milik sendiri bila dikonfirmasi", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    renderWithProviders(HomePage);

    await openDeleteAll();

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Semua kursus berhasil dihapus"
      )
    );
    expect(deleteAllCourses).toHaveBeenCalled();
  });

  it("menampilkan pesan error bila hapus semua gagal", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteAllCourses).mockRejectedValue(new Error("Gagal semua"));
    renderWithProviders(HomePage);

    await openDeleteAll();

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal semua")
    );
  });
});

describe("HomePage - tambah kursus", () => {
  it("membuka dan menutup modal tambah kursus", async () => {
    renderWithProviders(HomePage);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await click(screen.getByRole("button", { name: "Tambah Kursus" }));
    expect(
      screen.getByRole("dialog", { name: "Tambah Kursus" })
    ).toBeInTheDocument();

    await click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
