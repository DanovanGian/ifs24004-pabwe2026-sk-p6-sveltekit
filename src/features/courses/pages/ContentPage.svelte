<script lang="ts">
  import { ArrowLeft, Video } from "lucide-svelte";
  import {
    getYoutubeEmbedUrl,
    runWithFeedback,
  } from "../../../helpers/toolsHelper";
  import {
    content,
    isContentLoading,
    isContentMutating,
    loadContent,
    setLearnStatus,
  } from "../states/coursesStore";

  let { courseId, contentId }: { courseId: string; contentId: string } =
    $props();

  const embedUrl = $derived(getYoutubeEmbedUrl($content.youtube));

  $effect(() => {
    loadContent(contentId);
  });

  const reload = () => loadContent(contentId);
  const toggleFinished = () =>
    runWithFeedback(
      () => setLearnStatus(contentId, $content.my_status_finished ? 0 : 1),
      reload,
    );
</script>

{#if $isContentLoading}
  <h1 class="sr-only">Materi Kursus</h1>
  <p class="text-slate-600">Memuat materi...</p>
{:else if !$content}
  <div class="space-y-4">
    <h1 class="text-2xl font-extrabold">Materi tidak ditemukan.</h1>
    <a href={`/courses/${courseId}`} class="font-semibold text-indigo-600">Kembali ke kursus</a>
  </div>
{:else}
  <div class="max-w-4xl space-y-6">
    <a href={`/courses/${courseId}`} class="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
      <ArrowLeft class="h-4 w-4" /> <span>Kembali ke kursus</span>
    </a>
    <h1 class="flex items-center gap-3 text-2xl font-extrabold">
      <Video class="h-6 w-6 text-indigo-600" />
      <span>{$content.title}</span>
    </h1>

    {#if embedUrl}
      <div class="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embedUrl}
          title={$content.title}
          class="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <p class="rounded-xl bg-amber-50 p-4 text-amber-700">
        Tautan YouTube tidak valid.
      </p>
    {/if}

    <button
      type="button"
      onclick={toggleFinished}
      disabled={$isContentMutating}
      class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
    >
      {#if $content.my_status_finished}
        Tandai Belum Selesai
      {:else}
        Tandai Selesai
      {/if}
    </button>
  </div>
{/if}