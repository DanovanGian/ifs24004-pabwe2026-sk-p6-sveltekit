<script lang="ts">
  import { page } from "$app/state";
  import { BookOpen, Users, User } from "lucide-svelte";
  import { cn } from "../../../helpers/toolsHelper";

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = false, onclose = () => {} }: Props = $props();

  const items = [
    { href: "/", label: "Semua Kursus", icon: BookOpen },
    { href: "/users", label: "Pengguna", icon: Users },
    { href: "/profile", label: "Profil", icon: User },
  ];

  function isActive(href: string): boolean {
    const path = page.url.pathname;
    if (href === "/") return path === "/" || path.startsWith("/courses");
    return path.startsWith(href);
  }
</script>

{#if open}
  <button
    type="button"
    aria-label="Tutup menu"
    class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
    onclick={onclose}
  ></button>
{/if}

<aside
  class={cn(
    "fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white pt-16 transition-transform lg:translate-x-0",
    open ? "translate-x-0" : "-translate-x-full"
  )}
>
  <nav class="space-y-1 p-4">
    {#each items as item (item.href)}
      <a
        href={item.href}
        onclick={onclose}
        class={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold",
          isActive(item.href)
            ? "bg-indigo-50 text-indigo-600"
            : "text-slate-600 hover:bg-slate-100"
        )}
      >
        <item.icon size={18} />
        {item.label}
      </a>
    {/each}
  </nav>
</aside>
