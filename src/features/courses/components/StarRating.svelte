<script lang="ts">
  import { Star } from "lucide-svelte";

  let { value = $bindable(0) }: { value?: number } = $props();
</script>

<div class="flex gap-1" role="group" aria-label="Rating">
  {#each [1, 2, 3, 4, 5] as star (star)}
    <button
      type="button"
      aria-label={`${star} bintang`}
      aria-pressed={star <= value}
      onclick={() => (value = star)}
      class:text-amber-400={star <= value}
      class:text-slate-300={star > value}
    >
      <Star class="h-7 w-7" />
    </button>
  {/each}
</div>
