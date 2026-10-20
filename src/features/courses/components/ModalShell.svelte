<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "lucide-svelte";

  let {
    title,
    onClose,
    children,
  }: { title: string; onClose: () => void; children: Snippet } = $props();
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
  role="dialog"
  aria-modal="true"
  aria-label={title}
>
  <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold">{title}</h2>
      <button type="button" aria-label="Tutup" onclick={onClose}>
        <X class="h-5 w-5" />
      </button>
    </div>
    {@render children()}
  </div>
</div>
