import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/svelte";
import { click, makeCourse, renderWithProviders } from "../../../test-utils";
import CourseCard from "./CourseCard.svelte";

describe("CourseCard", () => {
  it("menampilkan data kursus", () => {
    renderWithProviders(CourseCard, { props: { course: makeCourse() } });

    expect(screen.getByText("Belajar ReactJS")).toBeInTheDocument();
    expect(screen.getByText("Belajar ReactJS dari awal")).toBeInTheDocument();
    expect(screen.getByText("Abdullah Ubaid")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // peserta
    expect(screen.getByText("3")).toBeInTheDocument(); // materi
    expect(screen.getByText("4.0")).toBeInTheDocument(); // rating
  });

  it("menautkan ke halaman detail", () => {
    renderWithProviders(CourseCard, { props: { course: makeCourse({ id: 7 }) } });

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "/courses/7");
    }
  });

  it("menampilkan sampul bila tersedia", () => {
    renderWithProviders(CourseCard, { props: { course: makeCourse() } });

    expect(screen.getByAltText("Belajar ReactJS")).toHaveAttribute(
      "src",
      "http://localhost/cover.jpg"
    );
  });

  it("menampilkan pengganti bila tanpa sampul", () => {
    renderWithProviders(CourseCard, {
      props: { course: makeCourse({ cover: null }) },
    });

    expect(screen.queryByAltText("Belajar ReactJS")).not.toBeInTheDocument();
  });

  it("beralih ke pengganti saat sampul gagal dimuat", async () => {
    renderWithProviders(CourseCard, { props: { course: makeCourse() } });

    await fireEvent.error(screen.getByAltText("Belajar ReactJS"));

    expect(screen.queryByAltText("Belajar ReactJS")).not.toBeInTheDocument();
  });

  it("menampilkan tanda hubung bila belum ada rating", () => {
    renderWithProviders(CourseCard, {
      props: { course: makeCourse({ avg_ratings: null }) },
    });

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("menyembunyikan tombol hapus bila bukan pemilik", () => {
    renderWithProviders(CourseCard, {
      props: { course: makeCourse(), isOwner: false },
    });

    expect(screen.queryByLabelText("Hapus kursus")).not.toBeInTheDocument();
  });

  it("memanggil ondelete dengan kursusnya bila pemilik menekan hapus", async () => {
    const ondelete = vi.fn();
    const course = makeCourse();
    renderWithProviders(CourseCard, {
      props: { course, isOwner: true, ondelete },
    });

    await click(screen.getByLabelText("Hapus kursus"));

    expect(ondelete).toHaveBeenCalledWith(course);
  });

  it("aman dipakai tanpa ondelete (nilai bawaan)", async () => {
    renderWithProviders(CourseCard, {
      props: { course: makeCourse(), isOwner: true },
    });

    await click(screen.getByLabelText("Hapus kursus"));

    expect(screen.getByLabelText("Hapus kursus")).toBeInTheDocument();
  });
});
