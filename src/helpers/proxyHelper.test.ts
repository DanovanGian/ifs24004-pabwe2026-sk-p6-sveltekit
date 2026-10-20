import { describe, expect, it, vi } from "vitest";
import { proxyRequest } from "./proxyHelper";

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("proxyRequest", () => {
  it("GET: meneruskan Authorization dan query tanpa body", async () => {
    const fetchMock = stubFetch(
      new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const request = new Request("http://localhost/api/courses?is_me=1", {
      method: "GET",
      headers: { Authorization: "Bearer tok", Cookie: "rahasia=1" },
    });

    const response = await proxyRequest(request, "courses", "?is_me=1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/courses?is_me=1`);
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(init.headers.get("authorization")).toBe("Bearer tok");
    expect(init.headers.get("content-type")).toBeNull();
    expect(init.headers.get("cookie")).toBeNull();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toEqual({ status: "success" });
  });

  it("POST: meneruskan Content-Type dan body", async () => {
    const fetchMock = stubFetch(
      new Response(JSON.stringify({ status: "fail" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );
    const request = new Request("http://localhost/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    const response = await proxyRequest(request, "courses", "");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/courses`);
    expect(init.method).toBe("POST");
    expect(init.body.byteLength).toBe(2);
    expect(init.headers.get("content-type")).toBe("application/json");
    expect(init.headers.get("authorization")).toBeNull();
    expect(response.status).toBe(400);
  });

  it("memakai application/json bila respons asal tanpa Content-Type", async () => {
    stubFetch(new Response(null, { status: 204 }));
    const request = new Request("http://localhost/api/courses/1", {
      method: "DELETE",
    });

    const response = await proxyRequest(request, "courses/1", "");

    expect(response.status).toBe(204);
    expect(response.headers.get("content-type")).toBe("application/json");
  });

  it("mengubah kegagalan jaringan menjadi respons 502", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const request = new Request("http://localhost/api/courses");

    const response = await proxyRequest(request, "courses", "");

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.status).toBe("fail");
    expect(body.message).toMatch(/terhubung/i);
  });
});
