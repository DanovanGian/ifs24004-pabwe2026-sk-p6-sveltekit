import { goto } from "$app/navigation";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import {
  fail,
  makeContent,
  makeDetail,
  makeUser,
  ok,
  renderWithProviders,
  submitForm,
  typeInto,
} from "../../../test-utils";
import * as api from "../api/courseApi";
import DetailPage from "./DetailPage.svelte";

vi.mock("../api/courseApi");

const PROFILE_ID = 1;

const asOwner = { user_id: PROFILE_ID, students: [PROFILE_ID] }; // pemilik sekaligus peserta
const asStudent = { user_id: 2, students: [PROFILE_ID] };
const asGuest = { user_id: 2, students: [] as number[] };

async function setup(override: Partial<CourseDetail> = asGuest) {
  vi.mocked(api.getCourse).mockResolvedValue(ok({ course: makeDetail(override) }));
  const view = renderWithProviders(DetailPage, {
    token: "t",
    profile: makeUser({ id: PROFILE_ID }),
    props: { courseId: "10" },
  });
  await screen.findByRole("heading", { name: "Belajar Svelte" });
  return view;
}

const confirmNo = () =>
  vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);

describe("status halaman", () => {
  it("menampilkan status memuat", async () => {
    vi.mocked(api.getCourse).mockReturnValue(new Promise(() => {}));
    renderWithProviders(DetailPage, { token: "t", profile: makeUser(), props: { courseId: "10" } });
    expect(await screen.findByText("Memuat kursus...")).toBeInTheDocument();
  });

  it("menampilkan pesan bila kursus tidak ditemukan", async () => {
    vi.mocked(api.getCourse).mockResolvedValue(fail());
    renderWithProviders(DetailPage, { token: "t", profile: makeUser(), props: { courseId: "10" } });
    expect(await screen.findByText("Kursus tidak ditemukan.")).toBeInTheDocument();
    expect(api.getCourse).toHaveBeenCalledWith("10");
  });

  it("menampilkan teks kosong untuk materi dan rating", async () => {
    await setup({ ...asGuest, contents: [], ratings: [] });
    expect(screen.getByText("Belum ada materi.")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating.")).toBeInTheDocument();
  });
});

describe("antarmuka berdasarkan peran", () => {
  it("pemilik didahulukan walau juga terdaftar sebagai peserta", async () => {
    await setup(asOwner);
    expect(screen.getByRole("button", { name: "Ubah Data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ubah Sampul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus Kursus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah Materi" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Keluar dari Kursus" })).not.toBeInTheDocument();
    expect(screen.queryByText("Progres Belajar")).not.toBeInTheDocument();
  });

  it("peserta melihat progres, rating, dan tautan materi", async () => {
    await setup(asStudent);
    expect(screen.getByRole("button", { name: "Keluar dari Kursus" })).toBeInTheDocument();
    expect(screen.getByText("50.00% selesai")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pengantar" })).toHaveAttribute("href", "/courses/10/contents/100");
    expect(screen.queryByRole("button", { name: "Tambah Materi" })).not.toBeInTheDocument();
  });

  it("tamu hanya bisa mendaftar dan tidak mendapat tautan materi", async () => {
    await setup(asGuest);
    expect(screen.getByRole("button", { name: "Daftar Kursus" })).toBeInTheDocument();
    expect(screen.getByText("Pengantar")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pengantar" })).not.toBeInTheDocument();
    expect(screen.getByText(/Ani · 5\/5/)).toBeInTheDocument();
  });
});

describe("aksi peserta", () => {
  it("tamu mendaftar lalu data dimuat ulang", async () => {
    vi.mocked(api.postStudent).mockResolvedValue(ok());
    await setup(asGuest);
    screen.getByRole("button", { name: "Daftar Kursus" }).click();
    await waitFor(() => expect(api.postStudent).toHaveBeenCalledWith("10"));
    await waitFor(() => expect(api.getCourse).toHaveBeenCalledTimes(2));
  });

  it("peserta keluar setelah konfirmasi", async () => {
    vi.mocked(api.deleteStudent).mockResolvedValue(ok());
    await setup(asStudent);
    screen.getByRole("button", { name: "Keluar dari Kursus" }).click();
    await waitFor(() => expect(api.deleteStudent).toHaveBeenCalledWith("10"));
  });

  it("peserta membatalkan keluar", async () => {
    await setup(asStudent);
    confirmNo();
    screen.getByRole("button", { name: "Keluar dari Kursus" }).click();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(api.deleteStudent).not.toHaveBeenCalled();
  });

  it("rating tanpa bintang ditolak dengan peringatan", async () => {
    const { container } = await setup(asStudent);
    await submitForm(container);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" })),
    );
    expect(api.putRating).not.toHaveBeenCalled();
  });

  it("peserta mengirim rating dan komentar", async () => {
    vi.mocked(api.putRating).mockResolvedValue(ok());
    const { container } = await setup(asStudent);
    screen.getByRole("button", { name: "4 bintang" }).click();
    await typeInto(screen.getByPlaceholderText("Tulis komentar"), "Mantap");
    await submitForm(container);
    await waitFor(() => expect(api.putRating).toHaveBeenCalledWith("10", 4, "Mantap"));
  });
});

describe("aksi pemilik", () => {
  it("menghapus kursus setelah konfirmasi lalu ke beranda", async () => {
    vi.mocked(api.deleteCourse).mockResolvedValue(ok());
    await setup(asOwner);
    screen.getByRole("button", { name: "Hapus Kursus" }).click();
    await waitFor(() => expect(api.deleteCourse).toHaveBeenCalledWith("10"));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("membatalkan penghapusan kursus", async () => {
    await setup(asOwner);
    confirmNo();
    screen.getByRole("button", { name: "Hapus Kursus" }).click();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(api.deleteCourse).not.toHaveBeenCalled();
  });

  it("menghapus materi setelah konfirmasi", async () => {
    vi.mocked(api.deleteContent).mockResolvedValue(ok());
    await setup(asOwner);
    screen.getByRole("button", { name: "Hapus materi Pengantar" }).click();
    await waitFor(() => expect(api.deleteContent).toHaveBeenCalledWith(100));
  });

  it("membatalkan penghapusan materi", async () => {
    await setup(asOwner);
    confirmNo();
    screen.getByRole("button", { name: "Hapus materi Pengantar" }).click();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(api.deleteContent).not.toHaveBeenCalled();
  });

  it("membuka dan menutup modal ubah data, sampul, dan materi", async () => {
    await setup({ ...asOwner, contents: [makeContent()] });

    screen.getByRole("button", { name: "Ubah Data" }).click();
    expect(await screen.findByRole("dialog", { name: "Ubah Kursus" })).toBeInTheDocument();
    screen.getByRole("button", { name: "Tutup" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    screen.getByRole("button", { name: "Ubah Sampul" }).click();
    expect(await screen.findByRole("dialog", { name: "Ubah Sampul" })).toBeInTheDocument();
    screen.getByRole("button", { name: "Tutup" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    screen.getByRole("button", { name: "Tambah Materi" }).click();
    expect(await screen.findByRole("dialog", { name: "Tambah Materi" })).toBeInTheDocument();
    screen.getByRole("button", { name: "Tutup" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    screen.getByRole("button", { name: "Ubah materi Pengantar" }).click();
    expect(await screen.findByRole("dialog", { name: "Ubah Materi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Pengantar");
  });

  it("menyimpan perubahan data kursus memuat ulang detail", async () => {
    vi.mocked(api.putCourse).mockResolvedValue(ok());
    const { container } = await setup(asOwner);
    screen.getByRole("button", { name: "Ubah Data" }).click();
    await screen.findByRole("dialog");
    await typeInto(screen.getByLabelText("Judul"), "Judul Baru");
    await submitForm(container);
    await waitFor(() => expect(api.putCourse).toHaveBeenCalledWith(10, "Judul Baru", "Dasar-dasar Svelte"));
    await waitFor(() => expect(api.getCourse).toHaveBeenCalledTimes(2));
  });

  it("menyimpan perubahan sampul kursus memuat ulang detail", async () => {
    vi.mocked(api.postCover).mockResolvedValue(ok());
    const { container } = await setup(asOwner);
    screen.getByRole("button", { name: "Ubah Sampul" }).click();
    await screen.findByRole("dialog", { name: "Ubah Sampul" });
    const file = new File(["dummy"], "cover.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Berkas sampul"), { target: { files: [file] } });
    await submitForm(container);
    await waitFor(() => expect(api.postCover).toHaveBeenCalledWith(10, file));
    await waitFor(() => expect(api.getCourse).toHaveBeenCalledTimes(2));
  });

  it("menyimpan penambahan materi baru memuat ulang detail", async () => {
    vi.mocked(api.postContent).mockResolvedValue(ok());
    const { container } = await setup(asOwner);
    screen.getByRole("button", { name: "Tambah Materi" }).click();
    await screen.findByRole("dialog", { name: "Tambah Materi" });
    await typeInto(screen.getByLabelText("Judul"), "Materi Baru");
    await typeInto(screen.getByLabelText("Tautan YouTube"), "https://youtu.be/abc");
    await submitForm(container);
    await waitFor(() => expect(api.postContent).toHaveBeenCalledWith(10, "Materi Baru", "https://youtu.be/abc"));
    await waitFor(() => expect(api.getCourse).toHaveBeenCalledTimes(2));
  });
});
