<script lang="ts">
  import "../index.css";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";

  let { children }: { children: Snippet } = $props();
</script>

{#if page.url.pathname.startsWith("/auth")}
  {@render children()}
{:else}
  <CourseLayout>
    {@render children()}
  </CourseLayout>
{/if}
