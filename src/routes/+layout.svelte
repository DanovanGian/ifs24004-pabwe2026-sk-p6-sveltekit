<script lang="ts">
  import "../index.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { loadSession } from "../features/auth/states/authStore";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";

  let { children } = $props();

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));

  onMount(() => {
    loadSession();
  });
</script>

{#if isAuthRoute}
  {@render children()}
{:else}
  <CourseLayout>
    {@render children()}
  </CourseLayout>
{/if}
