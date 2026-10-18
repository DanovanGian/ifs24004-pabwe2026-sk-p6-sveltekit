import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

// Objek biasa agar tes bisa mengubah pathname dan params sesuka hati.
vi.mock("$app/state", () => ({
  page: {
    url: new URL("http://localhost/"),
    params: {},
  },
}));

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
