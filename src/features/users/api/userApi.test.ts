import { describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../helpers/apiHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";

vi.mock("../../../helpers/apiHelper");

describe("userApi", () => {
  it("memanggil endpoint JSON dengan argumen yang benar", async () => {
    await getUsers();
    await getMe();
    await putMe("Budi", "b@d.id");
    await putPassword("lama", "baru", "baru");
    expect(vi.mocked(apiRequest).mock.calls).toEqual([
      ["GET", "/users"],
      ["GET", "/users/me"],
      ["PUT", "/users/me", { name: "Budi", email: "b@d.id" }],
      [
        "PUT",
        "/users/password",
        { password: "lama", new_password: "baru", new_password_confirmation: "baru" },
      ],
    ]);
  });

  it("postPhoto mengunggah berkas pada field photo", async () => {
    const file = new File(["x"], "foto.png");
    await postPhoto(file);
    const [method, path, form] = vi.mocked(apiRequest).mock.calls[0];
    expect(method).toBe("POST");
    expect(path).toBe("/users/me/photo");
    expect((form as FormData).get("photo")).toBeInstanceOf(File);
  });
});
