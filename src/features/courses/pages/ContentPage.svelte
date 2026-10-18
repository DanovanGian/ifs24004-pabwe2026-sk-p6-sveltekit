<script lang="ts">
  import { page } from "$app/state";
  import { ArrowLeft, Check, Video } from "lucide-svelte";
  import {
    courseContent,
    courseDetail,
    fetchCourseContent,
    fetchCourseDetail,
    changeContentStatus,
  } from "../states/coursesStore";
  import { authProfile } from "../../auth/states/authStore";
  import {
    getYoutubeEmbedUrl,
    showErrorDialog,
  } from "../../../helpers/toolsHelper";

  const courseId = $derived(page.params.courseId);
  const contentId = $derived(page.params.contentId);

  let loadError = $state("");
  let busy = $state(false);

  // Abaikan data kursus/materi lain yang masih tersisa di store.
  const content = $derived(
    $courseContent && String($courseContent.id) === contentId
      ? $courseContent
      : null
  );
  const detail = $derived(
    $courseDetail && String($courseDetail.id) === courseId ? $courseDetail : null
  );

  const isOwner = $derived(
    detail !== null && $authProfile !== null && detail.user_id === $authProfile.id
  );
  const isStudent = $derived(
    detail !== null &&
      $authProfile !== null &&
      detail.students.includes($authProfile.id)
  );
  const allowed = $derived(isOwner || isStudent);

  const embedUrl = $derived(content ? getYoutubeEmbedUrl(content.youtube) : null);

  $effect(() => {
    const currentCourse = courseId;
    const currentContent = contentId;
    loadError = "";
    Promise.all([
      fetchCourseDetail(currentCourse, true),
      fetchCourseContent(currentContent),
    ]).catch((error) => {
      loadError = (error as Error).message;
    });
  });

  async function toggleFinished() {
    if (!content) return;
    busy = true;
    try {
      await changeContentStatus(content.id, content.my_status_finished ? 0 : 1);
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      busy = false;
    }
  }
</script>

<a
  href={`/courses/${courseId}`}
  class="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
>
  <ArrowLeft size={16} />
  Kembali ke kursus
</a>

{#if loadError}
  <p class="text-red-600">{loadError}</p>
{:else if !content || !detail}
  <p class="text-slate-500">Memuat data...</p>
{:else if !allowed}
  <div class="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
    <p class="font-semibold text-slate-900">Materi ini belum bisa dibuka.</p>
    <p class="mt-1 text-sm text-slate-500">
      Ikuti kursus terlebih dahulu untuk mengakses materinya.
    </p>
  </div>
{:else}
  <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
    {#if embedUrl}
      <div class="aspect-video w-full bg-black">
        <iframe
          src={embedUrl}
          title={content.title}
          class="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <div
        class="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500"
      >
        <Video size={40} />
        <p class="text-sm">Tautan video tidak dapat diputar.</p>
      </div>
    {/if}

    <div class="flex flex-wrap items-center justify-between gap-3 p-6">
      <div class="min-w-0">
        <p class="text-sm text-slate-500">{detail.title}</p>
        <h1 class="text-xl font-extrabold text-slate-900">{content.title}</h1>
      </div>

      {#if isStudent}
        <button
          type="button"
          disabled={busy}
          class={content.my_status_finished
            ? "flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 font-semibold text-emerald-700 hover:bg-emerald-200 disabled:opacity-60"
            : "flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"}
          onclick={toggleFinished}
        >
          <Check size={16} />
          {content.my_status_finished ? "Selesai" : "Tandai selesai"}
        </button>
      {/if}
    </div>
  </div>
{/if}
