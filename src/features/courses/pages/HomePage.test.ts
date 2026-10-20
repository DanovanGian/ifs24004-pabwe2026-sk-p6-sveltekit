import { screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { makeCourse, ok, renderWithProviders, submitForm, typeInto, fail } from "../../../test-utils";
import { deleteAllCourses, getCourses, postCourse } from "../api/courseApi";
import HomePage from "./HomePage.svelte";

vi.mock("../api/courseApi");

const list = [
  makeCourse({ id: 1, title: "Svelte Dasar", description: "Belajar komponen" }),
  makeCourse({ id: 2, title: "Angular Lanjut", description: "Sinyal dan router" }),
];

function mockList() {
  vi.mocked(getCourses).mockResolvedValue(ok({ courses: list }));
}

describe("HomePage", () => {
  it("menampilkan status memuat", async () => {
    vi.mocked(getCourses).mockReturnValue(new Promise(() => {}));
    renderWithProviders(HomePage);
    expect(await screen.findByText("Memuat kursus...")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila tidak ada kursus", async () => {
    vi.mocked(getCourses).mockResolvedValue(fail());
    renderWithProviders(HomePage);
    expect(await screen.findByText("Kursus tidak ditemukan.")).toBeInTheDocument();
    expect(getCourses).toHaveBeenCalledWith(false);
  });

  it("menampilkan daftar dan menyaring berdasarkan judul atau deskripsi", async () => {
    mockList();
    renderWithProviders(HomePage);
    expect(await screen.findByText("Svelte Dasar")).toBeInTheDocument();
    expect(screen.getByText("Angular Lanjut")).toBeInTheDocument();

    const search = screen.getByLabelText("Cari kursus");
    await typeInto(search, "svelte");
    expect(screen.queryByText("Angular Lanjut")).not.toBeInTheDocument();

    await typeInto(search, "router");
    expect(screen.queryByText("Svelte Dasar")).not.toBeInTheDocument();
    expect(screen.getByText("Angular Lanjut")).toBeInTheDocument();

    await typeInto(search, "zzz");
    expect(screen.getByText("Kursus tidak ditemukan.")).toBeInTheDocument();
  });

  it("filter 'milik saya' memuat ulang daftar", async () => {
    mockList();
    renderWithProviders(HomePage);
    await screen.findByText("Svelte Dasar");
    screen.getByLabelText("Kursus milik saya").click();
    await waitFor(() => expect(getCourses).toHaveBeenLastCalledWith(true));
  });

  it("menambah kursus lewat modal lalu memuat ulang daftar", async () => {
    mockList();
    vi.mocked(postCourse).mockResolvedValue(ok());
    const { container } = renderWithProviders(HomePage);
    await screen.findByText("Svelte Dasar");

    screen.getByRole("button", { name: "Tambah Kursus" }).click();
    expect(await screen.findByRole("dialog", { name: "Tambah Kursus" })).toBeInTheDocument();

    // menutup modal
    screen.getByRole("button", { name: "Tutup" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // membuka lagi dan menyimpan
    screen.getByRole("button", { name: "Tambah Kursus" }).click();
    await screen.findByRole("dialog");
    await typeInto(screen.getByLabelText("Judul"), "Kursus X");
    await typeInto(screen.getByLabelText("Deskripsi"), "Deskripsi X");
    await submitForm(container);
    await waitFor(() => expect(postCourse).toHaveBeenCalledWith("Kursus X", "Deskripsi X"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(getCourses).toHaveBeenCalledTimes(2);
  });

  it("hapus semua: batal tidak memanggil API", async () => {
    mockList();
    renderWithProviders(HomePage);
    await screen.findByText("Svelte Dasar");
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    screen.getByRole("button", { name: "Hapus Semua Milikku" }).click();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(deleteAllCourses).not.toHaveBeenCalled();
  });

  it("hapus semua: konfirmasi memanggil API lalu memuat ulang", async () => {
    mockList();
    vi.mocked(deleteAllCourses).mockResolvedValue(ok());
    renderWithProviders(HomePage);
    await screen.findByText("Svelte Dasar");
    screen.getByRole("button", { name: "Hapus Semua Milikku" }).click();
    await waitFor(() => expect(deleteAllCourses).toHaveBeenCalledOnce());
    await waitFor(() => expect(getCourses).toHaveBeenCalledTimes(2));
  });
});
