import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { authApi } from "../../auth/api/authApi";
import { authToken } from "../../auth/states/authStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { click, renderWithProviders } from "../../../test-utils";
import Navbar from "./Navbar.svelte";

vi.mock("../../auth/api/authApi", () => ({
  authApi: { logout: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showConfirmDialog: vi.fn() };
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("Navbar", () => {
  it("menampilkan nama aplikasi dan nama pengguna", () => {
    renderWithProviders(Navbar);

    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.getByText("Delcom Testing")).toBeInTheDocument();
  });

  it("tetap tampil tanpa profil", () => {
    renderWithProviders(Navbar, { user: null });

    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.queryByText("Delcom Testing")).not.toBeInTheDocument();
  });

  it("tombol menu memanggil ontoggle", async () => {
    const ontoggle = vi.fn();
    renderWithProviders(Navbar, { props: { ontoggle } });

    await click(screen.getByLabelText("Buka menu"));
    expect(ontoggle).toHaveBeenCalledTimes(1);
  });

  it("tombol menu aman dipakai tanpa ontoggle (nilai bawaan)", async () => {
    renderWithProviders(Navbar);

    await click(screen.getByLabelText("Buka menu"));
    expect(screen.getByLabelText("Buka menu")).toBeInTheDocument();
  });

  it("tidak keluar bila konfirmasi dibatalkan", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderWithProviders(Navbar);

    await click(screen.getByLabelText("Keluar"));
    await flush();

    expect(showConfirmDialog).toHaveBeenCalled();
    expect(authApi.logout).not.toHaveBeenCalled();
    expect(goto).not.toHaveBeenCalled();
    expect(get(authToken)).toBe("test-token");
  });

  it("keluar dari akun bila dikonfirmasi", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(authApi.logout).mockResolvedValue({} as any);
    renderWithProviders(Navbar);

    await click(screen.getByLabelText("Keluar"));

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(authApi.logout).toHaveBeenCalled();
    expect(get(authToken)).toBeNull();
  });

  it("tetap membersihkan sesi lokal walau permintaan logout gagal", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(authApi.logout).mockRejectedValue(new Error("401"));
    renderWithProviders(Navbar);

    await click(screen.getByLabelText("Keluar"));

    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(get(authToken)).toBeNull();
  });
});
