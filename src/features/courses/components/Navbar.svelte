<script lang="ts">
  import { goto } from "$app/navigation";
  import { GraduationCap, LogOut, Menu } from "lucide-svelte";
  import Avatar from "../../common/components/Avatar.svelte";
  import { authApi } from "../../auth/api/authApi";
  import { authProfile, setAuthLogout } from "../../auth/states/authStore";
  import { resetCoursesState } from "../states/coursesStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";

  interface Props {
    ontoggle?: () => void;
  }

  let { ontoggle = () => {} }: Props = $props();

  async function handleLogout() {
    const confirmed = await showConfirmDialog(
      "Keluar",
      "Yakin ingin keluar dari akun?"
    );
    if (!confirmed) return;

    try {
      await authApi.logout();
    } catch {
      // Token mungkin sudah kedaluwarsa di server; sesi lokal tetap kita bersihkan.
    }

    resetCoursesState();
    setAuthLogout();
    goto("/auth/login");
  }
</script>

<header
  class="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4"
>
  <div class="flex items-center gap-3">
    <button
      type="button"
      aria-label="Buka menu"
      class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      onclick={ontoggle}
    >
      <Menu size={20} />
    </button>

    <a href="/" class="flex items-center gap-2">
      <span
        class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"
      >
        <GraduationCap size={20} />
      </span>
      <span class="text-lg font-extrabold text-slate-900">Delcom Courses</span>
    </a>
  </div>

  <div class="flex items-center gap-3">
    <a href="/profile" class="flex items-center gap-2">
      <Avatar name={$authProfile?.name} photo={$authProfile?.photo} />
      <span class="hidden text-sm font-semibold text-slate-700 sm:inline">
        {$authProfile?.name}
      </span>
    </a>

    <button
      type="button"
      aria-label="Keluar"
      class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
      onclick={handleLogout}
    >
      <LogOut size={20} />
    </button>
  </div>
</header>
