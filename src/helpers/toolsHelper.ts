import Swal from "sweetalert2";
import { isSuccess } from "./apiHelper";

export function showSuccessDialog(message: string) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export function showErrorDialog(message: string) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export function showWarningDialog(message: string) {
  return Swal.fire({
    icon: "warning",
    title: "Perhatian",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export async function showConfirmDialog(message: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: "#4f46e5",
  });
  return result.isConfirmed;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Menggabungkan pesan utama dengan daftar pesan validasi dari `data`. */
export function getErrorMessage(response: ApiResponse): string {
  const data: Record<string, string | string[]> = response.data ?? {};
  const details = Object.values(data).flat().join("\n");
  return details ? `${response.message}\n${details}` : response.message;
}

export function getAssetUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, "")}`;
}

export function getPhotoUrl(photo: string | null, name: string): string {
  if (photo) {
    return getAssetUrl(photo);
  }
  return getInitialsAvatar(name);
}

/** Inisial (maks. 2 huruf/angka) dari nama; "?" bila tidak ada. */
export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .replaceAll(/[^\p{L}\p{N}]/gu, "")
      .toUpperCase() || "?"
  );
}

/** Avatar inisial berupa SVG data URI, dibuat lokal tanpa layanan pihak ketiga. */
export function getInitialsAvatar(name: string): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" fill="#4f46e5"/>' +
    '<text x="32" y="32" dy=".35em" text-anchor="middle" fill="#fff" ' +
    'font-family="system-ui,sans-serif" font-size="26" font-weight="600">' +
    `${getInitials(name)}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getCoverUrl(cover: string | null): string {
  return cover ? getAssetUrl(cover) : "/logo.svg";
}

export function formatRating(average: string | null): string {
  return average ? Number(average).toFixed(1) : "Belum ada rating";
}

const YOUTUBE_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;

/** Mengubah tautan YouTube (watch, youtu.be, embed, shorts) menjadi URL embed. */
export function getYoutubeEmbedUrl(url: string): string | null {
  const match = YOUTUBE_REGEX.exec(url);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

/**
 * Menjalankan permintaan API lalu menampilkan dialog hasilnya.
 * Mengembalikan `true` bila berhasil.
 */
export async function runWithFeedback(
  task: () => Promise<ApiResponse>,
  onSuccess: () => unknown,
): Promise<boolean> {
  const response = await task();
  if (isSuccess(response)) {
    await showSuccessDialog(response.message);
    await onSuccess();
    return true;
  }
  await showErrorDialog(getErrorMessage(response));
  return false;
}
