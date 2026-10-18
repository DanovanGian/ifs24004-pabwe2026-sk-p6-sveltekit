import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { authApi } from "../api/authApi";
import { userApi } from "../../users/api/userApi";
import { authProfile, authToken } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { mockUser, renderWithProviders } from "../../../test-utils";
import LoginForm from "./LoginForm.svelte";

vi.mock("../api/authApi", () => ({ authApi: { login: vi.fn() } }));
vi.mock("../../users/api/userApi", () => ({
  userApi: { getProfile: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn() };
});

async function fillAndSubmit(email = "a@b.c", password = "123456") {
  await fireEvent.input(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  await fireEvent.input(screen.getByLabelText("Kata sandi"), {
    target: { value: password },
  });
  await fireEvent.submit(document.querySelector("form")!);
}

beforeEach(() => {
  renderWithProviders(LoginForm, { user: null });
});

describe("LoginForm", () => {
  it("menampilkan form dan tautan ke halaman daftar", () => {
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute(
      "href",
      "/auth/register"
    );
  });

  it("menampilkan status memproses lalu masuk dan menuju beranda", async () => {
    let resolveLogin!: (value: any) => void;
    vi.mocked(authApi.login).mockReturnValue(
      new Promise((resolve) => (resolveLogin = resolve))
    );
    vi.mocked(userApi.getProfile).mockResolvedValue(mockUser);

    await fillAndSubmit();
    expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();

    resolveLogin({ token: "tok", user: mockUser });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));

    expect(authApi.login).toHaveBeenCalledWith({
      email: "a@b.c",
      password: "123456",
    });
    expect(localStorage.getItem("token")).toBe("tok");
    expect(get(authToken)).toBe("tok");
    expect(get(authProfile)).toBe(mockUser);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila login gagal", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Kredensial salah"));

    await fillAndSubmit();

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Kredensial salah")
    );
    expect(goto).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("menghapus token bila profil gagal dimuat setelah login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "tok",
      user: mockUser,
    } as any);
    vi.mocked(userApi.getProfile).mockRejectedValue(new Error("401"));

    await fillAndSubmit();

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("401"));
    expect(localStorage.getItem("token")).toBeNull();
    expect(goto).not.toHaveBeenCalled();
  });
});
