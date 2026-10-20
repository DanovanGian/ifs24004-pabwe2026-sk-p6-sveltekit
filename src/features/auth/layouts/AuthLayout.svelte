<script lang="ts">
  import type { Snippet } from "svelte";
  import { BookOpen, GraduationCap, Video } from "lucide-svelte";
  import AuthSessionRedirect from "./AuthSessionRedirect.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<AuthSessionRedirect />

<div class="grid min-h-screen lg:grid-cols-2">
  <aside
    aria-label="Tentang Delcom Courses"
    class="hidden flex-col justify-between bg-indigo-600 p-12 text-white lg:flex"
  >
    <div class="flex items-center gap-3 text-2xl font-bold">
      <GraduationCap class="h-8 w-8" />
      Delcom Courses
    </div>
    <div class="space-y-6">
      <h2 class="text-4xl leading-tight font-extrabold">
        Belajar kapan saja, dari kursus yang kamu pilih.
      </h2>
      <p class="text-lg text-indigo-100">
        Delcom Courses adalah kumpulan kursus daring. Ikuti kursus, tonton
        materi video, pantau progres belajarmu, dan beri rating. Atau buat
        kursusmu sendiri dan bagikan ilmunya.
      </p>
      <ul class="space-y-3 text-indigo-100">
        <li class="flex items-center gap-3">
          <BookOpen class="h-5 w-5" /> Daftar dan keluar kursus dengan mudah
        </li>
        <li class="flex items-center gap-3">
          <Video class="h-5 w-5" /> Materi berupa video YouTube
        </li>
      </ul>
    </div>
    <p class="text-sm text-indigo-100">Praktikum PABWER 2026</p>
  </aside>

  <main class="flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <div
        class="mb-8 flex items-center gap-2 text-xl font-bold text-indigo-600 lg:hidden"
      >
        <GraduationCap class="h-6 w-6" /> Delcom Courses
      </div>
      {@render children()}
    </div>
  </main>
</div>
