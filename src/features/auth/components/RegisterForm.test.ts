import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import { authApi } from "../api/authApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import RegisterForm from "./RegisterForm.svelte";

vi.mock("../api/authApi", () => ({ authApi: { register: vi.fn() } }));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

async function fillAndSubmit() {
  await fireEvent.input(screen.getByLabelText("Nama"), {
    target: { value: "Budi" },
  });
  await fireEvent.input(screen.getByLabelText("Email"), {
    target: { value: "budi@delcom.org" },
  });
  await fireEvent.input(screen.getByLabelText("Kata sandi"), {
    target: { value: "123456" },
  });
  await fireEvent.submit(document.querySelector("form")!);
}

beforeEach(() => {
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
  renderWithProviders(RegisterForm, { user: null });
});

describe("RegisterForm", () => {
  it("menampilkan form dan tautan ke halaman masuk", () => {
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("mendaftar, menampilkan dialog sukses, lalu menuju halaman masuk", async () => {
    let resolveRegister!: (value: any) => void;
    vi.mocked(authApi.register).mockReturnValue(
      new Promise((resolve) => (resolveRegister = resolve))
    );

    await fillAndSubmit();
    expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();

    resolveRegister({ status: "success", message: "Berhasil mendaftar" });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));

    expect(authApi.register).toHaveBeenCalledWith({
      name: "Budi",
      email: "budi@delcom.org",
      password: "123456",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila pendaftaran gagal", async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error("Email dipakai"));

    await fillAndSubmit();

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai")
    );
    expect(goto).not.toHaveBeenCalled();
  });
});
