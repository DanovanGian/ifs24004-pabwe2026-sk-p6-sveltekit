import { screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { fail, makeUser, ok, renderWithProviders, submitForm, typeInto } from "../../../test-utils";
import { getMe } from "../../users/api/userApi";
import { postLogin } from "../api/authApi";
import { authProfile } from "../states/authStore";
import { get } from "svelte/store";
import LoginPage from "./LoginPage.svelte";

vi.mock("../api/authApi");
vi.mock("../../users/api/userApi");

async function fillAndSubmit(container: HTMLElement) {
  await typeInto(screen.getByLabelText("Email"), "budi@del.ac.id");
  await typeInto(screen.getByLabelText("Kata Sandi"), "rahasia");
  await submitForm(container);
}

describe("LoginPage", () => {
  it("menampilkan formulir dengan selector audit dan tautan daftar", () => {
    renderWithProviders(LoginPage);
    expect(screen.getByRole("heading", { name: "Masuk", level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "login-email-input");
    expect(screen.getByLabelText("Kata Sandi")).toHaveAttribute("id", "login-password-input");
    expect(screen.getByRole("button", { name: "Masuk" })).toHaveAttribute(
      "id",
      "login-submit-button",
    );
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/auth/register");
  });

  it("login berhasil memuat profil tanpa dialog error", async () => {
    vi.mocked(postLogin).mockResolvedValue(ok({ token: "tok", user: makeUser() }));
    vi.mocked(getMe).mockResolvedValue(ok({ user: makeUser() }));
    const { container } = renderWithProviders(LoginPage);
    await fillAndSubmit(container);
    await waitFor(() => expect(get(authProfile)).not.toBeNull());
    expect(postLogin).toHaveBeenCalledWith("budi@del.ac.id", "rahasia");
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it("login gagal menampilkan dialog error", async () => {
    vi.mocked(postLogin).mockResolvedValue(fail("Email atau kata sandi salah"));
    const { container } = renderWithProviders(LoginPage);
    await fillAndSubmit(container);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "Email atau kata sandi salah" }),
      ),
    );
  });
});
