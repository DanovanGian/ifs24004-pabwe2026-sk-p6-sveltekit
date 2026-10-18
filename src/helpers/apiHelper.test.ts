import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiHelper,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

function mockFetch(body: any, ok = true) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("token", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();

    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");

    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiHelper", () => {
  it("mengirim permintaan tanpa token dan tanpa body", async () => {
    const fetchMock = mockFetch({ status: "success", message: "ok" });

    const result = await apiHelper("/ping");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/ping`);
    expect(init.headers.get("Accept")).toBe("application/json");
    expect(init.headers.get("Authorization")).toBeNull();
    expect(init.headers.get("Content-Type")).toBeNull();
    expect(result).toEqual({ status: "success", message: "ok" });
  });

  it("menambahkan header Authorization dan Content-Type untuk body JSON", async () => {
    putAccessToken("token-123");
    const fetchMock = mockFetch({ status: "success", message: "ok" });

    await apiHelper("/data", { method: "POST", body: JSON.stringify({ a: 1 }) });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers.get("Authorization")).toBe("Bearer token-123");
    expect(init.headers.get("Content-Type")).toBe("application/json");
  });

  it("tidak mengatur Content-Type untuk FormData", async () => {
    const fetchMock = mockFetch({ status: "success", message: "ok" });
    const body = new FormData();
    body.append("cover", new File(["x"], "cover.png"));

    await apiHelper("/upload", { method: "POST", body });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.get("Content-Type")).toBeNull();
    expect(init.body).toBe(body);
  });

  it("melempar error dengan pesan server saat respons HTTP gagal", async () => {
    mockFetch({ status: "fail", message: "Tidak diizinkan" }, false);

    await expect(apiHelper("/x")).rejects.toThrow("Tidak diizinkan");
  });

  it("melempar error saat status 'fail' walau HTTP ok", async () => {
    mockFetch({ status: "fail", message: "Data tidak valid" }, true);

    await expect(apiHelper("/x")).rejects.toThrow("Data tidak valid");
  });

  it("memakai pesan bawaan bila server tidak memberi pesan", async () => {
    mockFetch({}, false);

    await expect(apiHelper("/x")).rejects.toThrow(
      "Terjadi kesalahan pada server"
    );
  });
});
