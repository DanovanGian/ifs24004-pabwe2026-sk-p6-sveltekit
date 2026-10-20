import type { RequestHandler } from "@sveltejs/kit";
import { proxyRequest } from "../../../helpers/proxyHelper";

// Menangani semua metode HTTP (GET, POST, PUT, DELETE, ...) untuk /api/*.
export const fallback: RequestHandler = ({ request, params, url }) =>
  proxyRequest(request, params.path, url.search);
