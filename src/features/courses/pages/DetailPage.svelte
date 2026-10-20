<script lang="ts">
  import { goto } from "$app/navigation";
  import { ArrowLeft, Camera, Check, Circle, Pencil, Plus, Trash2, Video } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import {
    formatDate,
    formatRating,
    getCoverUrl,
    getPhotoUrl,
    runWithFeedback,
    showConfirmDialog,
    showWarningDialog,
  } from "../../../helpers/toolsHelper";
  import { authProfile } from "../../auth/states/authStore";
  import StarRating from "../components/StarRating.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import {
    course,
    isCourseLoading,
    isRating,
    isStudentMutating,
    joinCourse,
    leaveCourse,
    loadCourse,
    rateCourse,
    removeContent,
    removeCourse,
  } from "../states/coursesStore";

  let { courseId }: { courseId: string } = $props();

  let showChange = $state(false);
  let showCover = $state(false);
  let showContent = $state(false);
  let editingContent: CourseContent | null = $state(null);
  let rating = $state(0);
  const { value: comment } = useInput("");

  // Pemilik: user_id sama dengan id profil. Peserta: id profil ada di `students`.
  // Antarmuka pemilik didahulukan bila keduanya terpenuhi.
  const role = $derived(
    $course.user_id === $authProfile.id
      ? "owner"
      : $course.students.includes($authProfile.id)
        ? "student"
        : "guest",
  );

  $effect(() => {
    loadCourse(courseId);
  });

  const reload = () => loadCourse(courseId);
  const closeModals = () => {
    showChange = false;
    showCover = false;
    showContent = false;
  };
  const openChange = () => (showChange = true);
  const openCover = () => (showCover = true);
  const openAddContent = () => {
    editingContent = null;
    showContent = true;
  };
  const openEditContent = (item: CourseContent) => {
    editingContent = item;
    showContent = true;
  };

  const join = () => runWithFeedback(() => joinCourse(courseId), reload);

  async function leave() {
    if (await showConfirmDialog("Keluar dari kursus ini?")) {
      await runWithFeedback(() => leaveCourse(courseId), reload);
    }
  }

  async function remove() {
    if (await showConfirmDialog("Hapus kursus ini beserta seluruh materinya?")) {
      await runWithFeedback(() => removeCourse(courseId), () => goto("/"));
    }
  }

  async function deleteContent(item: CourseContent) {
    if (await showConfirmDialog(`Hapus materi "${item.title}"?`)) {
      await runWithFeedback(() => removeContent(item.id), reload);
    }
  }

  async function submitRating(event: SubmitEvent) {
    event.preventDefault();
    if (rating < 1) {
      await showWarningDialog("Pilih rating 1 sampai 5.");
      return;
    }
    await runWithFeedback(() => rateCourse(courseId, rating, $comment), reload);
  }
</script>

{#if $isCourseLoading}
  <h1 class="sr-only">Detail Kursus</h1>
  <p class="text-slate-600">Memuat kursus...</p>
{:else if !$course}
  <div class="space-y-4">
    <h1 class="text-2xl font-extrabold">Kursus tidak ditemukan.</h1>
    <a href="/" class="font-semibold text-indigo-600">Kembali ke daftar kursus</a>
  </div>
{:else}
  <div class="space-y-8">
    <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
      <ArrowLeft class="h-4 w-4" /> Semua Kursus
    </a>

    <section class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <img
        src={getCoverUrl($course.cover)}
        alt={`Sampul ${$course.title}`}
        width="1024"
        height="224"
        fetchpriority="high"
        decoding="async"
        class="h-56 w-full bg-indigo-50 object-cover"
      />
      <div class="space-y-4 p-6">
        <h1 class="text-3xl font-extrabold">{$course.title}</h1>
        <p class="text-slate-600">{$course.description}</p>
        <div class="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span class="flex items-center gap-2">
            <img
              src={getPhotoUrl($course.author.photo, $course.author.name)}
              alt={$course.author.name}
              width="24"
              height="24"
              decoding="async"
              class="h-6 w-6 rounded-full object-cover"
            />
            <span>{$course.author.name}</span>
          </span>
          <span>{`Dibuat ${formatDate($course.created_at)}`}</span>
          <span>{`${$course.students.length} peserta`}</span>
          <span>{`Rating: ${formatRating($course.avg_ratings)}`}</span>
        </div>

        <div class="flex flex-wrap gap-3">
          {#if role === "owner"}
            <button type="button" onclick={openChange} class="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold">
              <Pencil class="h-4 w-4" /> Ubah Data
            </button>
            <button type="button" onclick={openCover} class="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold">
              <Camera class="h-4 w-4" /> Ubah Sampul
            </button>
            <button type="button" onclick={remove} class="flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-700">
              <Trash2 class="h-4 w-4" /> Hapus Kursus
            </button>
          {:else if role === "student"}
            <button
              type="button"
              onclick={leave}
              disabled={$isStudentMutating}
              class="rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-700 disabled:opacity-60"
            >
              Keluar dari Kursus
            </button>
          {:else}
            <button
              type="button"
              onclick={join}
              disabled={$isStudentMutating}
              class="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              Daftar Kursus
            </button>
          {/if}
        </div>
      </div>
    </section>

    {#if role === "student"}
      <section class="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold">Progres Belajar</h2>
        <div class="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full bg-indigo-600"
            style:width={`${$course.my_percentage_finished}%`}
          ></div>
        </div>
        <p class="text-sm text-slate-600">{`${$course.my_percentage_finished}% selesai`}</p>

        <form class="space-y-3" onsubmit={submitRating} novalidate>
          <h3 class="font-semibold">Beri Rating</h3>
          <StarRating bind:value={rating} />
          <label for="rating-comment" class="sr-only">Komentar</label>
          <textarea name="comment"
            id="rating-comment"
            rows="3"
            placeholder="Tulis komentar"
            bind:value={$comment}
            class="w-full rounded-xl border border-slate-300 px-4 py-3"
          ></textarea>
          <button
            type="submit"
            disabled={$isRating}
            class="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            Kirim Rating
          </button>
        </form>
      </section>
    {/if}

    <section class="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">{`Materi (${$course.total_contents})`}</h2>
        {#if role === "owner"}
          <button type="button" onclick={openAddContent} class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">
            <Plus class="h-4 w-4" /> Tambah Materi
          </button>
        {/if}
      </div>
      <ul class="divide-y divide-slate-100">
        {#each $course.contents as item (item.id)}
          <li class="flex items-center justify-between gap-3 py-3">
            <div class="flex items-center gap-3">
              {#if role === "student"}
                {#if item.my_status_finished}
                  <Check class="h-5 w-5 text-emerald-600" />
                {:else}
                  <Circle class="h-5 w-5 text-slate-300" />
                {/if}
              {:else}
                <Video class="h-5 w-5 text-slate-400" />
              {/if}
              {#if role === "guest"}
                <span>{item.title}</span>
              {:else}
                <a href={`/courses/${$course.id}/contents/${item.id}`} class="font-medium hover:text-indigo-600">
                  {item.title}
                </a>
              {/if}
            </div>
            {#if role === "owner"}
              <div class="flex gap-2">
                <button type="button" aria-label={`Ubah materi ${item.title}`} onclick={() => openEditContent(item)}>
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" aria-label={`Hapus materi ${item.title}`} onclick={() => deleteContent(item)}>
                  <Trash2 class="h-4 w-4 text-rose-700" />
                </button>
              </div>
            {/if}
          </li>
        {:else}
          <li class="py-3 text-slate-600">Belum ada materi.</li>
        {/each}
      </ul>
    </section>

    <section class="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 class="text-lg font-bold">Rating Peserta</h2>
      <ul class="space-y-3">
        {#each $course.ratings as item}
          <li>
            <p class="font-semibold">{`${item.name} · ${item.ratings}/5`}</p>
            <p class="text-sm text-slate-600">{item.comment}</p>
          </li>
        {:else}
          <li class="text-slate-600">Belum ada rating.</li>
        {/each}
      </ul>
    </section>
  </div>

  {#if showChange}
    <ChangeModal course={$course} onClose={closeModals} onSaved={reload} />
  {/if}
  {#if showCover}
    <ChangeCoverModal courseId={$course.id} onClose={closeModals} onSaved={reload} />
  {/if}
  {#if showContent}
    <ContentModal courseId={$course.id} content={editingContent} onClose={closeModals} onSaved={reload} />
  {/if}
{/if}
