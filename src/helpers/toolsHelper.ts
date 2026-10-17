import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Swal from "sweetalert2";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | number | Date): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function showSuccessDialog(message: string) {
  return Swal.fire({ icon: "success", title: "Berhasil", text: message });
}

export function showErrorDialog(message: string) {
  return Swal.fire({ icon: "error", title: "Gagal", text: message });
}

export async function showConfirmDialog(
  title: string,
  text: string
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

// Foto dari API bisa berupa URL penuh atau path relatif ("img/profile/1_xxx.png").
export function getPhotoUrl(photo?: string | null): string | null {
  if (!photo) return null;
  if (/^https?:\/\//.test(photo)) return photo;
  const origin = new URL(DELCOM_BASEURL).origin;
  return `${origin}/${photo.replace(/^\//, "")}`;
}
