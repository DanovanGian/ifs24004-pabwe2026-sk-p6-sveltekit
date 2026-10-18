import { describe, expect, it, vi } from "vitest";
import { apiHelper } from "../../../helpers/apiHelper";
import { authApi } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiHelper: vi.fn(),
}));

describe("authApi", () => {
  it("register mengirim POST dan mengembalikan respons", async () => {
    const response = { status: "success", message: "Berhasil" };
    vi.mocked(apiHelper).mockResolvedValue(response as any);
    const payload = { name: "A", email: "a@b.c", password: "123456" };

    const result = await authApi.register(payload);

    expect(apiHelper).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result).toBe(response);
  });

  it("login mengembalikan data berisi user dan token", async () => {
    const data = { user: { id: 1 }, token: "tok" };
    vi.mocked(apiHelper).mockResolvedValue({ data } as any);
    const payload = { email: "a@b.c", password: "123456" };

    const result = await authApi.login(payload);

    expect(apiHelper).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result).toBe(data);
  });

  it("logout mengirim POST ke /auth/logout", async () => {
    vi.mocked(apiHelper).mockResolvedValue({ status: "success" } as any);

    await authApi.logout();

    expect(apiHelper).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
