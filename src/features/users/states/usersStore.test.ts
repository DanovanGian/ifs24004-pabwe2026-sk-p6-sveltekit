import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fail, makeUser, ok, resetStores } from "../../../test-utils";
import { authProfile } from "../../auth/states/authStore";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";
import {
  isPasswordSaving,
  isPhotoSaving,
  isProfileSaving,
  isUsersLoading,
  loadUsers,
  updatePassword,
  updatePhoto,
  updateProfile,
  users,
} from "./usersStore";

vi.mock("../api/userApi");

beforeEach(resetStores);

describe("loadUsers", () => {
  it("mengisi daftar pengguna bila berhasil", async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [makeUser()] }));
    await loadUsers();
    expect(get(users)).toHaveLength(1);
    expect(get(isUsersLoading)).toBe(false);
  });

  it("membiarkan daftar bila gagal", async () => {
    vi.mocked(getUsers).mockResolvedValue(fail());
    await loadUsers();
    expect(get(users)).toEqual([]);
  });
});

describe("updateProfile", () => {
  it("memperbarui profil bila berhasil", async () => {
    vi.mocked(putMe).mockResolvedValue(ok({ user: makeUser({ name: "Baru" }) }));
    await updateProfile("Baru", "b@d.id");
    expect(get(authProfile)?.name).toBe("Baru");
    expect(get(isProfileSaving)).toBe(false);
  });

  it("tidak mengubah profil bila gagal", async () => {
    vi.mocked(putMe).mockResolvedValue(fail());
    await updateProfile("Baru", "b@d.id");
    expect(get(authProfile)).toBeNull();
  });
});

describe("updatePhoto", () => {
  it("memuat ulang profil setelah unggah berhasil", async () => {
    vi.mocked(postPhoto).mockResolvedValue(ok());
    vi.mocked(getMe).mockResolvedValue(ok({ user: makeUser({ photo: "p.png" }) }));
    await updatePhoto(new File(["x"], "p.png"));
    expect(get(authProfile)?.photo).toBe("p.png");
    expect(get(isPhotoSaving)).toBe(false);
  });

  it("tidak memuat ulang profil bila gagal", async () => {
    vi.mocked(postPhoto).mockResolvedValue(fail());
    await updatePhoto(new File(["x"], "p.png"));
    expect(getMe).not.toHaveBeenCalled();
  });
});

describe("updatePassword", () => {
  it("meneruskan ketiga kata sandi", async () => {
    vi.mocked(putPassword).mockResolvedValue(ok());
    await updatePassword("a", "b", "c");
    expect(putPassword).toHaveBeenCalledWith("a", "b", "c");
    expect(get(isPasswordSaving)).toBe(false);
  });
});
