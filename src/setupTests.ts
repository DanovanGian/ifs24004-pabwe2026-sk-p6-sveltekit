import "@testing-library/jest-dom/vitest";
import Swal from "sweetalert2";
import { afterEach, beforeEach, vi } from "vitest";

// Ikon lucide-svelte diganti komponen kosong agar tes ringan.
vi.mock("lucide-svelte", () => {
  const stub = () => {};
  const names = [
    "ArrowLeft",
    "BookOpen",
    "Camera",
    "Check",
    "Circle",
    "GraduationCap",
    "LogOut",
    "Menu",
    "Pencil",
    "Plus",
    "Search",
    "Star",
    "Trash2",
    "User",
    "Users",
    "Video",
    "X",
  ];
  return Object.fromEntries(names.map((name) => [name, stub]));
});

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));

vi.mock("$app/state", () => ({
  page: { url: new URL("http://localhost/"), params: {} },
}));

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

beforeEach(() => {
  vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});
