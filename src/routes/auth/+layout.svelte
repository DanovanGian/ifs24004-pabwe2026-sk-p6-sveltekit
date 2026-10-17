<script lang="ts">
  import { GraduationCap } from "lucide-svelte";
  import AuthSessionRedirect from "../../features/auth/components/AuthSessionRedirect.svelte";

  let { children } = $props();
</script>

<AuthSessionRedirect />

<div
  class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4"
>
  <div class="w-full max-w-md">
    <div class="mb-6 text-center">
      <div
        class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg"
      >
        <GraduationCap size={30} />
      </div>
      <h1 class="text-2xl font-extrabold text-slate-900">Delcom Courses</h1>
      <p class="mt-1 text-sm text-slate-500">
        Temukan, ikuti, dan kelola kursus belajarmu dalam satu tempat.
      </p>
    </div>

    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      {@render children()}
    </div>
  </div>
</div>
