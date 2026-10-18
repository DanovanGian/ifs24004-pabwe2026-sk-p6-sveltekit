import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import {
  cn,
  formatDate,
  getPhotoUrl,
  getYoutubeEmbedUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

describe("cn", () => {
  it("menggabungkan class dan mengabaikan nilai falsy", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("menyelesaikan konflik class Tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("formatDate", () => {
  it("memformat tanggal ke bahasa Indonesia", () => {
    expect(formatDate("2024-10-06T12:00:00Z")).toContain("2024");
  });
});

describe("getPhotoUrl", () => {
  it("mengembalikan null bila foto kosong", () => {
    expect(getPhotoUrl(null)).toBeNull();
    expect(getPhotoUrl(undefined)).toBeNull();
    expect(getPhotoUrl("")).toBeNull();
  });

  it("mengembalikan URL penuh apa adanya", () => {
    expect(getPhotoUrl("https://example.com/a.png")).toBe(
      "https://example.com/a.png"
    );
  });

  it("menyusun URL dari path relatif, dengan atau tanpa garis miring awal", () => {
    expect(new URL(getPhotoUrl("img/profile/1.png")!).pathname).toBe(
      "/img/profile/1.png"
    );
    expect(new URL(getPhotoUrl("/img/profile/1.png")!).pathname).toBe(
      "/img/profile/1.png"
    );
  });
});

describe("getYoutubeEmbedUrl", () => {
  const embed = "https://www.youtube.com/embed/abc123";

  it("mendukung youtu.be", () => {
    expect(getYoutubeEmbedUrl("https://youtu.be/abc123")).toBe(embed);
  });

  it("mendukung youtube.com/watch?v=", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(embed);
    expect(getYoutubeEmbedUrl("https://m.youtube.com/watch?v=abc123")).toBe(embed);
  });

  it("mendukung /embed/ dan /shorts/", () => {
    expect(getYoutubeEmbedUrl("https://youtube.com/embed/abc123")).toBe(embed);
    expect(getYoutubeEmbedUrl("https://youtube.com/shorts/abc123")).toBe(embed);
  });

  it("mengembalikan null untuk tautan yang tidak dikenali", () => {
    expect(getYoutubeEmbedUrl("https://youtube.com/watch")).toBeNull();
    expect(getYoutubeEmbedUrl("https://youtube.com/channel/xyz")).toBeNull();
    expect(getYoutubeEmbedUrl("https://example.com/video")).toBeNull();
    expect(getYoutubeEmbedUrl("bukan url")).toBeNull();
  });
});

describe("dialog", () => {
  it("showSuccessDialog dan showErrorDialog memanggil Swal.fire", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("gagal");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", text: "ok" })
    );
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "gagal" })
    );
  });

  it("showConfirmDialog mengembalikan pilihan pengguna", async () => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
    expect(await showConfirmDialog("Judul", "Teks")).toBe(true);

    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as any);
    expect(await showConfirmDialog("Judul", "Teks")).toBe(false);
  });
});
