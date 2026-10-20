import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { fail, makeUser, ok, renderWithProviders, submitForm, typeInto } from "../../../test-utils";
import { getMe, postPhoto, putMe, putPassword } from "../api/userApi";
import ProfilePage from "./ProfilePage.svelte";

vi.mock("../api/userApi");

const profile = makeUser({ name: "Budi", email: "budi@del.ac.id" });

describe("ProfilePage", () => {
  it("menampilkan data profil pada formulir", () => {
    renderWithProviders(ProfilePage, { profile });
    expect(screen.getByRole("heading", { name: "Budi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Budi");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@del.ac.id");
  });

  it("menyimpan data profil", async () => {
    vi.mocked(putMe).mockResolvedValue(ok({ user: makeUser({ name: "Baru" }) }));
    const { container } = renderWithProviders(ProfilePage, { profile });
    await typeInto(screen.getByLabelText("Nama"), "Baru");
    await submitForm(container, 0);
    await waitFor(() => expect(putMe).toHaveBeenCalledWith("Baru", "budi@del.ac.id"));
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success" })),
    );
  });

  it("memperingatkan bila foto belum dipilih", async () => {
    const { container } = renderWithProviders(ProfilePage, { profile });
    await submitForm(container, 1);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" })),
    );
    expect(postPhoto).not.toHaveBeenCalled();
  });

  it("mengunggah foto yang dipilih", async () => {
    vi.mocked(postPhoto).mockResolvedValue(ok());
    vi.mocked(getMe).mockResolvedValue(ok({ user: profile }));
    const { container } = renderWithProviders(ProfilePage, { profile });
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Berkas foto"), { target: { files: [file] } });
    await submitForm(container, 1);
    await waitFor(() => expect(postPhoto).toHaveBeenCalledWith(file));
    await waitFor(() => expect(getMe).toHaveBeenCalled());
  });

  it("mengubah kata sandi lalu mengosongkan kolom", async () => {
    vi.mocked(putPassword).mockResolvedValue(ok());
    const { container } = renderWithProviders(ProfilePage, { profile });
    await typeInto(screen.getByLabelText("Kata Sandi Saat Ini"), "lama");
    await typeInto(screen.getByLabelText("Kata Sandi Baru"), "baru123");
    await typeInto(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "baru123");
    await submitForm(container, 2);
    await waitFor(() => expect(putPassword).toHaveBeenCalledWith("lama", "baru123", "baru123"));
    await waitFor(() => expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue(""));
    expect(screen.getByLabelText("Kata Sandi Saat Ini")).toHaveValue("");
    expect(screen.getByLabelText("Konfirmasi Kata Sandi Baru")).toHaveValue("");
  });

  it("menampilkan dialog error saat perubahan gagal", async () => {
    vi.mocked(putPassword).mockResolvedValue(fail("Kata sandi salah"));
    const { container } = renderWithProviders(ProfilePage, { profile });
    await submitForm(container, 2);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Kata sandi salah" })),
    );
  });
});
