import { goto } from "$app/navigation";
import { screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { fail, ok, renderWithProviders, submitForm, typeInto } from "../../../test-utils";
import { postRegister } from "../api/authApi";
import RegisterPage from "./RegisterPage.svelte";

vi.mock("../api/authApi");

async function fillAndSubmit(container: HTMLElement) {
  await typeInto(screen.getByLabelText("Nama"), "Budi");
  await typeInto(screen.getByLabelText("Email"), "budi@del.ac.id");
  await typeInto(screen.getByLabelText("Kata Sandi"), "rahasia");
  await submitForm(container);
}

describe("RegisterPage", () => {
  it("menampilkan formulir dan tautan masuk", () => {
    renderWithProviders(RegisterPage);
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
  });

  it("registrasi berhasil: dialog sukses lalu ke halaman masuk", async () => {
    vi.mocked(postRegister).mockResolvedValue(ok(undefined, "Akun dibuat"));
    const { container } = renderWithProviders(RegisterPage);
    await fillAndSubmit(container);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(postRegister).toHaveBeenCalledWith("Budi", "budi@del.ac.id", "rahasia");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Akun dibuat" }));
  });

  it("registrasi gagal: dialog error dan tetap di halaman", async () => {
    vi.mocked(postRegister).mockResolvedValue(fail("Data tidak valid", { email: ["sudah dipakai"] }));
    const { container } = renderWithProviders(RegisterPage);
    await fillAndSubmit(container);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "Data tidak valid\nsudah dipakai" }),
      ),
    );
    expect(goto).not.toHaveBeenCalled();
  });
});
