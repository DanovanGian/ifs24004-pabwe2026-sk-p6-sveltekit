<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "lucide-svelte";

  interface Props {
    open: boolean;
    title: string;
    onclose?: () => void;
    children: Snippet;
  }

  let { open, title, onclose = () => {}, children }: Props = $props();
</script>

<svelte:window
  onkeydown={(event) => {
    if (open && event.key === "Escape") onclose();
  }}
/>

{#if open}
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <button
      type="button"
      aria-label="Tutup"
      class="absolute inset-0 bg-slate-900/50"
      onclick={onclose}
    ></button>

    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          aria-label="Tutup"
          class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          onclick={onclose}
        >
          <X size={18} />
        </button>
      </div>

      {@render children()}
    </div>
  </div>
{/if}
