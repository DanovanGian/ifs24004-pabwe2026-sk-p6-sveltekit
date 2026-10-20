import { screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { makeCourse, renderWithProviders } from "../../../test-utils";
import CourseCard from "./CourseCard.svelte";

describe("CourseCard", () => {
  it("menampilkan ringkasan kursus dan tautan detail", () => {
    renderWithProviders(CourseCard, {
      props: { course: makeCourse({ students: [1, 2, 3], total_contents: 4 }) },
    });
    expect(screen.getByRole("link")).toHaveAttribute("href", "/courses/10");
    expect(screen.getByText("Belajar Svelte")).toBeInTheDocument();
    expect(screen.getByText("Dasar-dasar Svelte")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText(/4 materi/)).toBeInTheDocument();
    expect(screen.getByText(/3 peserta/)).toBeInTheDocument();
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    expect(screen.getByAltText("Sampul Belajar Svelte")).toHaveAttribute("src", "/logo.svg");
  });

  it("memakai sampul dan menampilkan teks bila belum ada rating", () => {
    renderWithProviders(CourseCard, {
      props: { course: makeCourse({ cover: "https://x.test/c.png", avg_ratings: null }) },
    });
    expect(screen.getByAltText("Sampul Belajar Svelte")).toHaveAttribute("src", "https://x.test/c.png");
    expect(screen.getByText(/Belum ada rating/)).toBeInTheDocument();
  });
});
