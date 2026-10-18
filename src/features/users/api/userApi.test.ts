import { describe, expect, it, vi } from "vitest";
import { apiHelper } from "../../../helpers/apiHelper";
import { userApi } from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiHelper: vi.fn(),
}));

describe("userApi", () => {
  it("getUsers mengembalikan data.users", async () => {
    const users = [{ id: 1 }, { id: 2 }];
    vi.mocked(apiHelper).mockResolvedValue({ data: { users } } as any);

    expect(await userApi.getUsers()).toBe(users);
    expect(apiHelper).toHaveBeenCalledWith("/users");
  });

  it("getUserById mengembalikan data.user", async () => {
    const user = { id: 7 };
    vi.mocked(apiHelper).mockResolvedValue({ data: { user } } as any);

    expect(await userApi.getUserById(7)).toBe(user);
    expect(apiHelper).toHaveBeenCalledWith("/users/7");
  });

  it("getProfile mengembalikan data.user dari /users/me", async () => {
    const user = { id: 1 };
    vi.mocked(apiHelper).mockResolvedValue({ data: { user } } as any);

    expect(await userApi.getProfile()).toBe(user);
    expect(apiHelper).toHaveBeenCalledWith("/users/me");
  });

  it("updateProfile mengirim PUT dan mengembalikan user terbaru", async () => {
    const user = { id: 1, name: "Baru" };
    vi.mocked(apiHelper).mockResolvedValue({ data: { user } } as any);
    const payload = { name: "Baru", email: "baru@delcom.org" };

    expect(await userApi.updateProfile(payload)).toBe(user);
    expect(apiHelper).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  });

  it("changePhoto mengirim FormData berisi berkas 'photo'", async () => {
    vi.mocked(apiHelper).mockResolvedValue({ status: "success" } as any);
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await userApi.changePhoto(file);

    const [path, init] = vi.mocked(apiHelper).mock.calls[0] as [string, any];
    expect(path).toBe("/users/me/photo");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("photo")).toBe(file);
  });

  it("changePassword mengirim PUT ke /users/password", async () => {
    vi.mocked(apiHelper).mockResolvedValue({ status: "success" } as any);
    const payload = {
      password: "123456",
      new_password: "654321",
      new_password_confirmation: "654321",
    };

    await userApi.changePassword(payload);

    expect(apiHelper).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  });
});
