import { beforeEach, describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { screen, waitFor } from "@testing-library/svelte";
import {
  changeContentStatus,
  courseContent,
  courseDetail,
  fetchCourseContent,
  fetchCourseDetail,
} from "../states/coursesStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  click,
  makeContent,
  makeCourseDetail,
  mockUser,
  renderWithProviders,
} from "../../../test-utils";
import ContentPage from "./ContentPage.svelte";

vi.mock("../states/coursesStore", async () => {
  const { writable } = await import("svelte/store");
  return {
    courseContent: writable(null),
    courseDetail: writable(null),
    fetchCourseContent: vi.fn(),
    fetchCourseDetail: vi.fn(),
    changeContentStatus: vi.fn(),
  };
});

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn() };
});

type Setup = {
  content?: ReturnType<typeof makeContent> | null;
  detail?: ReturnType<typeof makeCourseDetail> | null;
  user?: typeof mockUser | null;
};

function renderContent({
  content = makeContent(),
  detail = makeCourseDetail(),
  user = mockUser,
}: Setup = {}) {
  courseContent.set(content);
  courseDetail.set(detail);
  return renderWithProviders(ContentPage, {
    params: { courseId: "1", contentId: "9" },
    user,
  });
}

// mockUser.id = 1
const owner = () => makeCourseDetail({ user_id: 1 });
const student = () => makeCourseDetail({ students: [1] });

beforeEach(() => {
  courseContent.set(null);
  courseDetail.set(null);
  vi.mocked(fetchCourseContent).mockResolvedValue(undefined as any);
  vi.mocked(fetchCourseDetail).mockResolvedValue(undefined as any);
  vi.mocked(changeContentStatus).mockResolvedValue(undefined as any);
});

describe("ContentPage - pemuatan", () => {
  it("memuat detail kursus dan materi saat dibuka", () => {
    renderContent({ content: null, detail: null });

    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
    expect(fetchCourseDetail).toHaveBeenCalledWith("1", true);
    expect(fetchCourseContent).toHaveBeenCalledWith("9");
    expect(
      screen.getByRole("link", { name: "Kembali ke kursus" })
    ).toHaveAttribute("href", "/courses/1");
  });

  it("menunggu bila hanya materi yang tersedia", () => {
    renderContent({ detail: null });
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("menunggu bila hanya detail kursus yang tersedia", () => {
    renderContent({ content: null });
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("mengabaikan materi atau kursus lain yang tersisa di store", () => {
    renderContent({ content: makeContent({ id: 99 }), detail: owner() });
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("mengabaikan detail kursus lain yang tersisa di store", () => {
    renderContent({ detail: makeCourseDetail({ id: 99, user_id: 1 }) });
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("menampilkan pesan bila pemuatan gagal", async () => {
    vi.mocked(fetchCourseContent).mockRejectedValue(new Error("Materi tidak ada"));
    renderContent({ content: null, detail: null });

    expect(await screen.findByText("Materi tidak ada")).toBeInTheDocument();
  });
});

describe("ContentPage - akses", () => {
  it("menolak pengunjung yang belum mengikuti kursus", () => {
    renderContent();

    expect(screen.getByText("Materi ini belum bisa dibuka.")).toBeInTheDocument();
    expect(screen.queryByTitle("Dasar Java")).not.toBeInTheDocument();
  });

  it("menolak pengguna tanpa profil", () => {
    renderContent({ user: null });

    expect(screen.getByText("Materi ini belum bisa dibuka.")).toBeInTheDocument();
  });

  it("pemilik bisa menonton tanpa tombol selesai", () => {
    renderContent({ detail: owner() });

    expect(screen.getByTitle("Dasar Java")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/uHyfQV0kbgo"
    );
    expect(screen.getByRole("heading", { name: "Dasar Java" })).toBeInTheDocument();
    expect(screen.getByText("Belajar ReactJS")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tandai selesai" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Selesai" })).not.toBeInTheDocument();
  });

  it("menampilkan pesan bila tautan video tidak bisa diputar", () => {
    renderContent({
      content: makeContent({ youtube: "https://example.com/video" }),
      detail: owner(),
    });

    expect(screen.getByText("Tautan video tidak dapat diputar.")).toBeInTheDocument();
    expect(screen.queryByTitle("Dasar Java")).not.toBeInTheDocument();
  });
});

describe("ContentPage - status belajar", () => {
  it("peserta menandai materi selesai", async () => {
    renderContent({ detail: student() });

    await click(screen.getByRole("button", { name: "Tandai selesai" }));

    await waitFor(() =>
      expect(changeContentStatus).toHaveBeenCalledWith(9, 1)
    );
  });

  it("peserta membatalkan tanda selesai", async () => {
    renderContent({
      content: makeContent({ my_status_finished: true }),
      detail: student(),
    });

    await click(screen.getByRole("button", { name: "Selesai" }));

    await waitFor(() =>
      expect(changeContentStatus).toHaveBeenCalledWith(9, 0)
    );
  });

  it("menonaktifkan tombol selama proses berjalan", async () => {
    let resolve!: () => void;
    vi.mocked(changeContentStatus).mockReturnValue(
      new Promise<void>((res) => (resolve = res)) as any
    );
    renderContent({ detail: student() });

    await click(screen.getByRole("button", { name: "Tandai selesai" }));
    expect(screen.getByRole("button", { name: "Tandai selesai" })).toBeDisabled();

    resolve();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Tandai selesai" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila gagal mengubah status", async () => {
    vi.mocked(changeContentStatus).mockRejectedValue(new Error("Gagal status"));
    renderContent({ detail: student() });

    await click(screen.getByRole("button", { name: "Tandai selesai" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal status")
    );
  });

  it("tidak melakukan apa-apa bila materi hilang sebelum tombol diproses", async () => {
    renderContent({ detail: student() });
    const button = screen.getByRole("button", { name: "Tandai selesai" });

    courseContent.set(null);
    button.click();
    await tick();

    expect(changeContentStatus).not.toHaveBeenCalled();
  });
});
