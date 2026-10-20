import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import {
  formatDate,
  formatRating,
  getAssetUrl,
  getCoverUrl,
  getErrorMessage,
  getInitials,
  getPhotoUrl,
  getYoutubeEmbedUrl,
  runWithFeedback,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

const origin = new URL(DELCOM_BASEURL).origin;

describe("dialog", () => {
  it("menampilkan dialog sukses, error, dan peringatan", () => {
    showSuccessDialog("a");
    showErrorDialog("b");
    showWarningDialog("c");
    const calls = vi.mocked(Swal.fire).mock.calls.map((c) => c[0]);
    expect(calls[0]).toMatchObject({ icon: "success", text: "a" });
    expect(calls[1]).toMatchObject({ icon: "error", text: "b" });
    expect(calls[2]).toMatchObject({ icon: "warning", text: "c" });
  });

  it("showConfirmDialog mengembalikan pilihan pengguna", async () => {
    expect(await showConfirmDialog("yakin?")).toBe(true);
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    expect(await showConfirmDialog("yakin?")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "question", showCancelButton: true }),
    );
  });
});

describe("formatDate", () => {
  it("memakai format Indonesia", () => {
    const text = formatDate("2026-10-14T12:00:00Z");
    expect(text).toContain("Oktober");
    expect(text).toContain("2026");
  });
});

describe("getErrorMessage", () => {
  it("menggabungkan pesan dengan detail validasi", () => {
    expect(
      getErrorMessage({ status: "fail", message: "Data tidak valid", data: { title: ["wajib", "pendek"] } }),
    ).toBe("Data tidak valid\nwajib\npendek");
  });

  it("hanya pesan bila tidak ada data atau data kosong", () => {
    expect(getErrorMessage({ status: "fail", message: "Gagal" })).toBe("Gagal");
    expect(getErrorMessage({ status: "fail", message: "Gagal", data: {} })).toBe("Gagal");
  });
});

describe("URL aset", () => {
  it("getAssetUrl: URL absolut dibiarkan, path relatif diberi origin", () => {
    expect(getAssetUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(getAssetUrl("storage/a.png")).toBe(`${origin}/storage/a.png`);
    expect(getAssetUrl("/storage/a.png")).toBe(`${origin}/storage/a.png`);
  });

  it("getPhotoUrl: memakai foto atau avatar inisial", () => {
    expect(getPhotoUrl("https://x.test/p.png", "Budi")).toBe("https://x.test/p.png");
    const avatar = getPhotoUrl(null, "Budi Santoso");
    expect(avatar.startsWith("data:image/svg+xml,")).toBe(true);
    expect(decodeURIComponent(avatar)).toContain(">BS</text>");
  });

  it("getInitials: maksimal dua huruf, simbol dibuang, kosong menjadi ?", () => {
    expect(getInitials("budi santoso wijaya")).toBe("BS");
    expect(getInitials("Budi")).toBe("B");
    expect(getInitials("  ")).toBe("?");
    expect(getInitials("&<")).toBe("?");
  });

  it("getCoverUrl: memakai sampul atau logo bawaan", () => {
    expect(getCoverUrl("https://x.test/c.png")).toBe("https://x.test/c.png");
    expect(getCoverUrl(null)).toBe("/logo.svg");
  });
});

describe("formatRating", () => {
  it("membulatkan satu desimal atau menampilkan teks kosong", () => {
    expect(formatRating("4.0000")).toBe("4.0");
    expect(formatRating("3.666")).toBe("3.7");
    expect(formatRating(null)).toBe("Belum ada rating");
  });
});

describe("getYoutubeEmbedUrl", () => {
  const id = "dQw4w9WgXcQ";
  it.each([
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/shorts/${id}`,
  ])("mengenali %s", (url) => {
    expect(getYoutubeEmbedUrl(url)).toBe(`https://www.youtube.com/embed/${id}`);
  });

  it("mengembalikan null untuk tautan lain", () => {
    expect(getYoutubeEmbedUrl("https://contoh.com/video")).toBeNull();
  });
});

describe("runWithFeedback", () => {
  it("sukses: dialog sukses lalu onSuccess dipanggil", async () => {
    const onSuccess = vi.fn();
    const result = await runWithFeedback(
      async () => ({ status: "success", message: "Tersimpan" }),
      onSuccess,
    );
    expect(result).toBe(true);
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Tersimpan" }));
  });

  it("gagal: dialog error dan onSuccess tidak dipanggil", async () => {
    const onSuccess = vi.fn();
    const result = await runWithFeedback(
      async () => ({ status: "fail", message: "Ditolak" }),
      onSuccess,
    );
    expect(result).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Ditolak" }));
  });
});
