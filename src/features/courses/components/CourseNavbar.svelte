<script lang="ts">
  import { GraduationCap, LogOut, Menu } from "lucide-svelte";
  import { getPhotoUrl } from "../../../helpers/toolsHelper";

  let {
    profile,
    onToggleSidebar,
    onLogout,
  }: {
    profile: User;
    onToggleSidebar: () => void;
    onLogout: () => void;
  } = $props();
</script>

<header
  class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4"
>
  <div class="flex items-center gap-3">
    <button
      type="button"
      aria-label="Buka menu"
      class="lg:hidden"
      onclick={onToggleSidebar}
    >
      <Menu class="h-6 w-6" />
    </button>
    <a href="/" class="flex items-center gap-2 text-lg font-extrabold text-indigo-600">
      <GraduationCap class="h-7 w-7" />
      Delcom Courses
    </a>
  </div>
  <div class="flex items-center gap-3">
    <img
      src={getPhotoUrl(profile.photo, profile.name)}
      alt={profile.name}
      width="36"
      height="36"
      decoding="async"
      class="h-9 w-9 rounded-full object-cover"
    />
    <span class="hidden text-sm font-semibold sm:inline">{profile.name}</span>
    <button
      type="button"
      aria-label="Keluar"
      class="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
      onclick={onLogout}
    >
      <LogOut class="h-5 w-5" />
    </button>
  </div>
</header>
