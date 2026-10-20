<script lang="ts">
  import type { Snippet } from "svelte";
  import AuthLayout from "../../features/auth/layouts/AuthLayout.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<AuthLayout>
  {@render children()}
</AuthLayout>
