import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { userApi } from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { mockUser, renderWithProviders } from "../../../test-utils";
import UsersPage from "./UsersPage.svelte";

vi.mock("../api/userApi", () => ({ userApi: { getUsers: vi.fn() } }));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn() };
});

const users = [
  { ...mockUser, id: 1, name: "Budi", email: "budi@delcom.org", photo: "" },
  { ...mockUser, id: 2, name: "Citra", email: "citra@delcom.org", photo: "" },
];

beforeEach(() => {
  vi.mocked(userApi.getUsers).mockResolvedValue(users);
});

describe("UsersPage", () => {
  it("menampilkan teks memuat lalu daftar pengguna", async () => {
    let resolveUsers!: (value: typeof users) => void;
    vi.mocked(userApi.getUsers).mockReturnValue(
      new Promise((resolve) => (resolveUsers = resolve))
    );
    renderWithProviders(UsersPage);

    expect(screen.getByText("Memuat data...")).toBeInTheDocument();

    resolveUsers(users);
    await waitFor(() => expect(screen.getByText("Budi")).toBeInTheDocument());

    expect(screen.getByText("budi@delcom.org")).toBeInTheDocument();
    expect(screen.getByText("Citra")).toBeInTheDocument();
    expect(screen.queryByText("Memuat data...")).not.toBeInTheDocument();
  });

  it("menampilkan pesan bila belum ada pengguna", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue([]);
    renderWithProviders(UsersPage);

    await waitFor(() =>
      expect(screen.getByText("Belum ada pengguna.")).toBeInTheDocument()
    );
  });

  it("menampilkan pesan error bila pemuatan gagal", async () => {
    vi.mocked(userApi.getUsers).mockRejectedValue(new Error("Tidak diizinkan"));
    renderWithProviders(UsersPage);

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Tidak diizinkan")
    );
    expect(screen.getByText("Belum ada pengguna.")).toBeInTheDocument();
  });
});
