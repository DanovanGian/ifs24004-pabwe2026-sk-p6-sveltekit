import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { userApi } from "../api/userApi";
import { authProfile } from "../../auth/states/authStore";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { mockUser, renderWithProviders } from "../../../test-utils";
import ProfilePage from "./ProfilePage.svelte";

vi.mock("../api/userApi", () => ({
  userApi: {
    updateProfile: vi.fn(),
    changePhoto: vi.fn(),
    getProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => (resolve = res));
  return { promise, resolve };
}

const profileForm = () => document.querySelectorAll("form")[0];
const passwordForm = () => document.querySelectorAll("form")[1];
const photoInput = () => screen.getByLabelText("Ganti foto");
const photo = new File(["x"], "foto.png", { type: "image/png" });

async function fillPasswords() {
  await fireEvent.input(screen.getByLabelText("Kata sandi saat ini"), {
    target: { value: "123456" },
  });
  await fireEvent.input(screen.getByLabelText("Kata sandi baru"), {
    target: { value: "654321" },
  });
  await fireEvent.input(screen.getByLabelText("Konfirmasi kata sandi baru"), {
    target: { value: "654321" },
  });
}

beforeEach(() => {
  vi.mocked(userApi.updateProfile).mockResolvedValue(mockUser);
  vi.mocked(userApi.changePhoto).mockResolvedValue({} as any);
  vi.mocked(userApi.getProfile).mockResolvedValue(mockUser);
  vi.mocked(userApi.changePassword).mockResolvedValue({} as any);
  vi.mocked(showSuccessDialog).mockResolvedValue(undefined as any);
});

describe("ProfilePage - tampilan", () => {
  it("mengisi form dengan data profil", () => {
    renderWithProviders(ProfilePage);

    expect(screen.getByLabelText("Nama")).toHaveValue("Delcom Testing");
    expect(screen.getByLabelText("Email")).toHaveValue("testing@delcom.org");
  });

  it("form kosong tanpa profil, lalu terisi saat profil tiba", async () => {
    renderWithProviders(ProfilePage, { user: null });
    expect(screen.getByLabelText("Nama")).toHaveValue("");

    authProfile.set(mockUser);

    await waitFor(() =>
      expect(screen.getByLabelText("Nama")).toHaveValue("Delcom Testing")
    );
  });
});

describe("ProfilePage - ubah profil", () => {
  it("menyimpan perubahan dan memperbarui profil di store", async () => {
    vi.mocked(userApi.updateProfile).mockResolvedValue({
      ...mockUser,
      name: "Nama Baru",
    });
    renderWithProviders(ProfilePage);

    await fireEvent.input(screen.getByLabelText("Nama"), {
      target: { value: "Nama Baru" },
    });
    await fireEvent.submit(profileForm());

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Profil berhasil diperbarui"
      )
    );
    expect(userApi.updateProfile).toHaveBeenCalledWith({
      name: "Nama Baru",
      email: "testing@delcom.org",
    });
    expect(get(authProfile)?.name).toBe("Nama Baru");
  });

  it("menampilkan status menyimpan selama proses berjalan", async () => {
    const pending = deferred<typeof mockUser>();
    vi.mocked(userApi.updateProfile).mockReturnValue(pending.promise);
    renderWithProviders(ProfilePage);

    await fireEvent.submit(profileForm());
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    pending.resolve(mockUser);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila gagal", async () => {
    vi.mocked(userApi.updateProfile).mockRejectedValue(new Error("Email dipakai"));
    renderWithProviders(ProfilePage);

    await fireEvent.submit(profileForm());

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai")
    );
  });
});

describe("ProfilePage - ganti foto", () => {
  it("tidak melakukan apa-apa bila tidak ada berkas dipilih", async () => {
    renderWithProviders(ProfilePage);

    await fireEvent.change(photoInput(), { target: { files: [] } });
    await fireEvent.change(photoInput(), { target: { files: null } });

    expect(userApi.changePhoto).not.toHaveBeenCalled();
  });

  it("mengunggah foto lalu memuat ulang profil", async () => {
    const updated = { ...mockUser, photo: "img/profile/baru.png" };
    vi.mocked(userApi.getProfile).mockResolvedValue(updated);
    renderWithProviders(ProfilePage);

    await fireEvent.change(photoInput(), { target: { files: [photo] } });

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith(
        "Foto profil berhasil diperbarui"
      )
    );
    expect(userApi.changePhoto).toHaveBeenCalledWith(photo);
    expect(get(authProfile)).toBe(updated);
  });

  it("menampilkan status mengunggah dan menonaktifkan input", async () => {
    const pending = deferred();
    vi.mocked(userApi.changePhoto).mockReturnValue(pending.promise as any);
    renderWithProviders(ProfilePage);

    await fireEvent.change(photoInput(), { target: { files: [photo] } });
    expect(screen.getByLabelText("Mengunggah...")).toBeDisabled();

    pending.resolve();
    await waitFor(() => expect(screen.getByLabelText("Ganti foto")).toBeEnabled());
  });

  it("menampilkan pesan error bila unggahan gagal", async () => {
    vi.mocked(userApi.changePhoto).mockRejectedValue(new Error("Berkas besar"));
    renderWithProviders(ProfilePage);

    await fireEvent.change(photoInput(), { target: { files: [photo] } });

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Berkas besar")
    );
  });
});

describe("ProfilePage - ubah kata sandi", () => {
  it("mengirim kata sandi lalu mengosongkan form", async () => {
    renderWithProviders(ProfilePage);

    await fillPasswords();
    await fireEvent.submit(passwordForm());

    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Kata sandi berhasil diubah")
    );
    expect(userApi.changePassword).toHaveBeenCalledWith({
      password: "123456",
      new_password: "654321",
      new_password_confirmation: "654321",
    });
    expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("");
    expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("");
    expect(screen.getByLabelText("Konfirmasi kata sandi baru")).toHaveValue("");
  });

  it("menampilkan status menyimpan selama proses berjalan", async () => {
    const pending = deferred();
    vi.mocked(userApi.changePassword).mockReturnValue(pending.promise as any);
    renderWithProviders(ProfilePage);

    await fireEvent.submit(passwordForm());
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    pending.resolve();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Ubah kata sandi" })).toBeEnabled()
    );
  });

  it("menampilkan pesan error bila gagal", async () => {
    vi.mocked(userApi.changePassword).mockRejectedValue(new Error("Sandi salah"));
    renderWithProviders(ProfilePage);

    await fillPasswords();
    await fireEvent.submit(passwordForm());

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Sandi salah")
    );
    expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("654321");
  });
});
