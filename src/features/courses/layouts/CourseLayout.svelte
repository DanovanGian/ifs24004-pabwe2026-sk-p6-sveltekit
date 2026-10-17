<script lang="ts">
  import { goto } from "$app/navigation";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import {
    authToken,
    authProfile,
    isAuthenticated,
    isProfile,
  } from "../../auth/states/authStore";

  let { children } = $props();

  let sidebarOpen = $state(false);

  const ready = $derived(Boolean($isAuthenticated && $authProfile));

  // Tidak ada token dan tidak sedang memuat profil: arahkan ke halaman masuk.
  $effect(() => {
    if (!$isProfile && !$authToken) {
      goto("/auth/login");
    }
  });
</script>

{#if ready}
  <Navbar ontoggle={() => (sidebarOpen = !sidebarOpen)} />
  <Sidebar open={sidebarOpen} onclose={() => (sidebarOpen = false)} />

  <main class="pt-16 lg:pl-64">
    <div class="mx-auto max-w-6xl p-6">
      {@render children()}
    </div>
  </main>
{:else}
  <div class="flex min-h-screen items-center justify-center text-slate-500">
    Memuat...
  </div>
{/if}
