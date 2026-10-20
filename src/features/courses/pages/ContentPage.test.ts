import { screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { fail, makeContent, ok, renderWithProviders } from "../../../test-utils";
import { getContent, postLearn } from "../api/courseApi";
import ContentPage from "./ContentPage.svelte";

vi.mock("../api/courseApi");

const props = { courseId: "10", contentId: "100" };

function setup(override = {}) {
  vi.mocked(getContent).mockResolvedValue(ok({ course_content: makeContent(override) }));
  return renderWithProviders(ContentPage, { props });
}

describe("ContentPage", () => {
  it("menampilkan status memuat", async () => {
    vi.mocked(getContent).mockReturnValue(new Promise(() => {}));
    renderWithProviders(ContentPage, { props });
    expect(await screen.findByText("Memuat materi...")).toBeInTheDocument();
  });

  it("menampilkan pesan bila materi tidak ditemukan", async () => {
    vi.mocked(getContent).mockResolvedValue(fail());
    renderWithProviders(ContentPage, { props });
    expect(await screen.findByText("Materi tidak ditemukan.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke kursus" })).toHaveAttribute("href", "/courses/10");
    expect(getContent).toHaveBeenCalledWith("100");
  });

  it("memutar video YouTube dan menandai selesai", async () => {
    vi.mocked(postLearn).mockResolvedValue(ok());
    const { container } = setup();
    await screen.findByRole("heading", { name: "Pengantar" });
    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
    screen.getByRole("button", { name: "Tandai Selesai" }).click();
    await waitFor(() => expect(postLearn).toHaveBeenCalledWith("100", 1));
    await waitFor(() => expect(getContent).toHaveBeenCalledTimes(2));
  });

  it("menandai belum selesai bila sudah selesai", async () => {
    vi.mocked(postLearn).mockResolvedValue(ok());
    setup({ my_status_finished: true });
    (await screen.findByRole("button", { name: "Tandai Belum Selesai" })).click();
    await waitFor(() => expect(postLearn).toHaveBeenCalledWith("100", 0));
  });

  it("menampilkan pesan bila tautan YouTube tidak valid", async () => {
    const { container } = setup({ youtube: "https://contoh.com/video" });
    expect(await screen.findByText("Tautan YouTube tidak valid.")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
  });
});
