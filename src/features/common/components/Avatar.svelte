<script lang="ts">
  import { cn, getPhotoUrl } from "../../../helpers/toolsHelper";

  interface Props {
    name?: string;
    photo?: string | null;
    class?: string;
  }

  let { name = "", photo = null, class: className = "" }: Props = $props();

  let broken = $state(false);
  const src = $derived(getPhotoUrl(photo));
  const initial = $derived((name || "?").charAt(0).toUpperCase());
</script>

{#if src && !broken}
  <img
    {src}
    alt={name}
    onerror={() => (broken = true)}
    class={cn("h-10 w-10 rounded-full object-cover", className)}
  />
{:else}
  <div
    class={cn(
      "flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600",
      className
    )}
  >
    {initial}
  </div>
{/if}
