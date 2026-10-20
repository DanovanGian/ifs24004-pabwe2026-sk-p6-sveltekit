// Meneruskan permintaan dari browser ke Delcom Open API lewat server aplikasi.
// Browser hanya berbicara ke origin yang sama, jadi tidak ada permintaan CORS
// (termasuk peringatan "Authorization tidak tercakup wildcard *").

const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type"];

export async function proxyRequest(
  request: Request,
  path: string,
  search: string,
): Promise<Response> {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const upstream = await fetch(`${DELCOM_BASEURL}/${path}${search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({
        status: "fail",
        message: "Tidak dapat terhubung ke server.",
      }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }
}
