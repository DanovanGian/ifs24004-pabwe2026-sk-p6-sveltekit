# ifs24025-pabwe2026-sk-p6-sveltekit

Studi Kasus 2 (Praktikum 6): **Delcom Courses** — SvelteKit 3, TypeScript, Svelte 5,
Tailwind CSS v4, `lucide-svelte`, SweetAlert2, system fonts, Delcom Open API
(`https://open-api.delcom.org/api/v1`). Local builds use `adapter-bun`; Vercel builds
automatically use `adapter-vercel`.

## Menjalankan

```bash
bun install
bun run test:coverage   # line & function 100%; statement >= 99%, branch >= 85% (lihat vite.config.ts)
bun run dev             # http://localhost:3005
bun run build && bun start
```

Deploy to Vercel with the default SvelteKit build command (`bun run build`). Vercel
sets `VERCEL` during the build, which selects the Vercel adapter instead of producing
a Bun server build. The project pins Vercel's build and function runtime to Node 24.

`.env` (sudah disertakan) berisi `VITE_DELCOM_BASEURL` dan `APP_PORT=3005`.
For Vercel, set `VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1` in the
project's environment variables; if it is unset, production builds use that URL by
default. The local `.env` can continue pointing to `http://localhost:8000/api/v1`.
Jangan memakai `bun test`; gunakan `bun run test` atau `bun x vitest run`.

## Proxy API

Browser memanggil `/api/*` di origin aplikasi sendiri; `src/routes/api/[...path]/+server.ts`
meneruskannya ke `VITE_DELCOM_BASEURL` dari sisi server. Dengan begitu tidak ada permintaan
lintas-origin (CORS) dari browser ke Delcom Open API. Gambar sampul/foto tetap dimuat
langsung dari server Delcom lewat `getAssetUrl`.

## Struktur

- `src/routes` — halaman SvelteKit (`/`, `/courses/[courseId]`, `/courses/[courseId]/contents/[contentId]`, `/auth/*`, `/users`, `/profile`, `+error.svelte`)
- `src/features/{auth,users,courses,common}` — api, states (Svelte store), layouts, pages, modals, components
- `src/helpers`, `src/hooks` — `apiHelper`, `toolsHelper`, `storeHelper`, `useInput`
