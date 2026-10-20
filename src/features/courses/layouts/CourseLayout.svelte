<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    authProfile,
    authToken,
    loadProfile,
    logout,
  } from "../../auth/states/authStore";
  import CourseNavbar from "../components/CourseNavbar.svelte";
  import CourseSidebar from "../components/CourseSidebar.svelte";

  let { children }: { children: Snippet } = $props();

  let sidebarOpen = $state(false);

  const toggleSidebar = () => (sidebarOpen = !sidebarOpen);
  const closeSidebar = () => (sidebarOpen = false);

  // Tanpa token (atau setelah logout) pengguna diarahkan ke halaman masuk.
  $effect(() => {
    if (!$authToken) {
      goto("/auth/login");
    }
  });

  onMount(() => {
    if ($authToken && !$authProfile) {
      loadProfile();
    }
  });
</script>

{#if $authProfile}
  <CourseNavbar
    profile={$authProfile}
    onToggleSidebar={toggleSidebar}
    onLogout={logout}
  />
  <CourseSidebar
    open={sidebarOpen}
    currentPath={page.url.pathname}
    onClose={closeSidebar}
  />
  <main class="p-6 lg:ml-64">
    {@render children()}
  </main>
{:else}
  <main class="p-6">
    <h1 class="sr-only">Delcom Courses</h1>
    <p class="text-slate-600">Memuat...</p>
  </main>
{/if}
