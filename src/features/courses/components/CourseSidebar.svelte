<script lang="ts">
  import { BookOpen, User, Users } from "lucide-svelte";

  let {
    open,
    currentPath,
    onClose,
  }: { open: boolean; currentPath: string; onClose: () => void } = $props();

  const items = [
    { href: "/", label: "Semua Kursus", icon: BookOpen },
    { href: "/users", label: "Pengguna", icon: Users },
    { href: "/profile", label: "Profil", icon: User },
  ];
</script>

<aside
  aria-label="Menu utama"
  class="fixed top-16 bottom-0 left-0 z-20 w-64 border-r border-slate-200 bg-white p-4 lg:block"
  class:hidden={!open}
>
  <nav class="space-y-1">
    {#each items as item (item.href)}
      <a
        href={item.href}
        onclick={onClose}
        class="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
        class:bg-indigo-50={currentPath === item.href}
        class:text-indigo-600={currentPath === item.href}
      >
        <item.icon class="h-5 w-5" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>
