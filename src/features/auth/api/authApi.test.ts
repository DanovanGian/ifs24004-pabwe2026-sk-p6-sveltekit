import { describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../helpers/apiHelper";
import { postLogin, postRegister } from "./authApi";

vi.mock("../../../helpers/apiHelper");

describe("authApi", () => {
  it("postLogin mengirim email dan password", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ status: "success", message: "ok" });
    const result = await postLogin("a@b.c", "rahasia");
    expect(result.status).toBe("success");
    expect(apiRequest).toHaveBeenCalledWith("POST", "/auth/login", { email: "a@b.c", password: "rahasia" });
  });

  it("postRegister mengirim nama, email, dan password", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ status: "success", message: "ok" });
    await postRegister("Budi", "a@b.c", "rahasia");
    expect(apiRequest).toHaveBeenCalledWith("POST", "/auth/register", {
      name: "Budi",
      email: "a@b.c",
      password: "rahasia",
    });
  });
});
