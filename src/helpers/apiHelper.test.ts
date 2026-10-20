import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiRequest,
  getAccessToken,
  isSuccess,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

function stubFetch(data: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => data });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("token", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("isSuccess", () => {
  it("true hanya untuk status success", () => {
    expect(isSuccess({ status: "success", message: "" })).toBe(true);
    expect(isSuccess({ status: "fail", message: "" })).toBe(false);
  });
});

describe("apiRequest", () => {
  it("GET tanpa token dan tanpa payload", async () => {
    const fetchMock = stubFetch({ status: "success", message: "ok" });
    const result = await apiRequest("GET", "/courses");
    expect(result).toEqual({ status: "success", message: "ok" });
    expect(fetchMock).toHaveBeenCalledWith("/api/courses", {
      method: "GET",
      headers: {},
      body: undefined,
    });
  });

  it("mengirim JSON dengan header Authorization", async () => {
    putAccessToken("tok");
    const fetchMock = stubFetch({ status: "success", message: "ok" });
    await apiRequest("POST", "/courses", { title: "A" });
    expect(fetchMock).toHaveBeenCalledWith("/api/courses", {
      method: "POST",
      headers: {
        Authorization: "Bearer tok",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "A" }),
    });
  });

  it("mengirim FormData apa adanya", async () => {
    const fetchMock = stubFetch({ status: "success", message: "ok" });
    const form = new FormData();
    form.append("cover", new File(["x"], "c.png"));
    await apiRequest("POST", "/courses/1/cover", form);
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(form);
    expect(init.headers).toEqual({});
  });

  it("mengubah kegagalan jaringan menjadi respons fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await apiRequest("GET", "/courses");
    expect(result.status).toBe("fail");
    expect(result.message).toMatch(/terhubung/i);
  });
});
