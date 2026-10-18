<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    ArrowLeft,
    BookOpen,
    Camera,
    Check,
    Pencil,
    Plus,
    Star,
    Trash2,
    Users,
    Video,
  } from "lucide-svelte";
  import Avatar from "../../common/components/Avatar.svelte";
  import ChangeModal from "../components/ChangeModal.svelte";
  import ChangeCoverModal from "../components/ChangeCoverModal.svelte";
  import ContentModal from "../components/ContentModal.svelte";
  import type { CourseContent } from "../api/courseApi";
  import {
    courseDetail,
    fetchCourseDetail,
    deleteCourse,
    joinCourse,
    leaveCourse,
    changeRating,
    deleteContent,
    resetMutationFlags,
  } from "../states/coursesStore";
  import { authProfile } from "../../auth/states/authStore";
  import {
    formatDate,
    getPhotoUrl,
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  const courseId = $derived(page.params.courseId);

  let loadError = $state("");
  let showEdit = $state(false);
  let showCover = $state(false);
  let showContent = $state(false);
  let editingContent = $state<CourseContent | null>(null);
  let coverBroken = $state(false);
  let busy = $state(false);

  let myRating = $state<1 | 2 | 3 | 4 | 5>(5);
  let myComment = $state("");

  // Abaikan detail kursus lain yang masih tersisa di store.
  const detail = $derived(
    $courseDetail && String($courseDetail.id) === courseId ? $courseDetail : null
  );

  // Pemilik didahulukan bila pengguna memenuhi keduanya (pemilik dan peserta).
  const isOwner = $derived(
    detail !== null && $authProfile !== null && detail.user_id === $authProfile.id
  );
  const isStudent = $derived(
    detail !== null &&
      $authProfile !== null &&
      detail.students.includes($authProfile.id)
  );
  const canOpenContent = $derived(isOwner || isStudent);
  const cover = $derived(getPhotoUrl(detail?.cover));
  const avg = $derived(
    detail?.avg_ratings ? Number(detail.avg_ratings).toFixed(1) : null
  );

  $effect(() => {
    const id = courseId;
    resetMutationFlags();
    loadError = "";
    coverBroken = false;
    fetchCourseDetail(id).catch((error) => {
      loadError = (error as Error).message;
    });
  });

  async function run(action: () => Promise<unknown>, success?: string) {
    busy = true;
    try {
      await action();
      if (success) await showSuccessDialog(success);
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      busy = false;
    }
  }

  async function handleDeleteCourse() {
    if (!detail) return;
    const confirmed = await showConfirmDialog(
      "Hapus kursus",
      `Yakin ingin menghapus "${detail.title}"?`
    );
    if (!confirmed) return;

    await run(async () => {
      await deleteCourse(detail.id);
      goto("/");
    });
  }

  async function handleLeave() {
    const confirmed = await showConfirmDialog(
      "Keluar kursus",
      "Yakin ingin keluar dari kursus ini?"
    );
    if (!confirmed) return;
    await run(() => leaveCourse(courseId), "Berhasil keluar dari kursus");
  }

  async function handleDeleteContent(content: CourseContent) {
    const confirmed = await showConfirmDialog(
      "Hapus konten",
      `Yakin ingin menghapus "${content.title}"?`
    );
    if (!confirmed) return;
    await run(
      () => deleteContent(courseId, content.id),
      "Konten berhasil dihapus"
    );
  }

  function openAddContent() {
    editingContent = null;
    showContent = true;
  }

  function openEditContent(content: CourseContent) {
    editingContent = content;
    showContent = true;
  }

  function handleSubmitRating(event: SubmitEvent) {
    event.preventDefault();
    run(
      () => changeRating(courseId, { ratings: myRating, comment: myComment }),
      "Rating berhasil disimpan"
    );
  }
</script>

<a
  href="/"
  class="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
>
  <ArrowLeft size={16} />
  Semua Kursus
</a>

{#if loadError}
  <p class="text-red-600">{loadError}</p>
{:else if !detail}
  <p class="text-slate-500">Memuat data...</p>
{:else}
  <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
    <div class="relative">
      {#if cover && !coverBroken}
        <img
          src={cover}
          alt={detail.title}
          onerror={() => (coverBroken = true)}
          class="h-56 w-full object-cover"
        />
      {:else}
        <div
          class="flex h-56 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-400"
        >
          <BookOpen size={56} />
        </div>
      {/if}

      {#if isOwner}
        <button
          type="button"
          class="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-white"
          onclick={() => (showCover = true)}
        >
          <Camera size={16} />
          Ganti sampul
        </button>
      {/if}
    </div>

    <div class="p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl font-extrabold text-slate-900">{detail.title}</h1>
          <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Avatar
              name={detail.author.name}
              photo={detail.author.photo}
              class="h-6 w-6 text-xs"
            />
            <span>{detail.author.name}</span>
            <span>·</span>
            <span>{formatDate(detail.created_at)}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          {#if isOwner}
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
              onclick={() => (showEdit = true)}
            >
              <Pencil size={16} />
              Ubah
            </button>
            <button
              type="button"
              disabled={busy}
              class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
              onclick={handleDeleteCourse}
            >
              <Trash2 size={16} />
              Hapus
            </button>
          {:else if isStudent}
            <button
              type="button"
              disabled={busy}
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              onclick={handleLeave}
            >
              Keluar kursus
            </button>
          {:else}
            <button
              type="button"
              disabled={busy}
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              onclick={() =>
                run(() => joinCourse(courseId), "Berhasil mengikuti kursus")}
            >
              Ikuti kursus
            </button>
          {/if}
        </div>
      </div>

      <p class="mt-4 whitespace-pre-line text-slate-700">{detail.description}</p>

      <div class="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-600">
        <span class="flex items-center gap-1.5">
          <Users size={16} />
          {detail.students.length} peserta
        </span>
        <span class="flex items-center gap-1.5">
          <BookOpen size={16} />
          {detail.total_contents} materi
        </span>
        <span class="flex items-center gap-1.5">
          <Star size={16} class="text-amber-500" />
          {avg ?? "-"}
        </span>
      </div>

      {#if isStudent && !isOwner}
        <div class="mt-4">
          <div class="mb-1 flex justify-between text-xs font-semibold text-slate-500">
            <span>Progres belajarmu</span>
            <span>{Number(detail.my_percentage_finished).toFixed(0)}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-indigo-600"
              style={`width: ${Number(detail.my_percentage_finished)}%`}
            ></div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Daftar konten -->
  <section class="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-900">Materi</h2>
      {#if isOwner}
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          onclick={openAddContent}
        >
          <Plus size={16} />
          Tambah materi
        </button>
      {/if}
    </div>

    {#if detail.contents.length === 0}
      <p class="text-sm text-slate-500">Belum ada materi pada kursus ini.</p>
    {:else}
      <ul class="space-y-2">
        {#each detail.contents as content, index (content.id)}
          <li
            class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
              >
                <Video size={18} />
              </span>

              {#if canOpenContent}
                <a
                  href={`/courses/${detail.id}/contents/${content.id}`}
                  class="truncate font-semibold text-slate-900 hover:text-indigo-600"
                >
                  {index + 1}. {content.title}
                </a>
              {:else}
                <span class="truncate font-semibold text-slate-500">
                  {index + 1}. {content.title}
                </span>
              {/if}
            </div>

            <div class="flex shrink-0 items-center gap-1">
              {#if content.my_status_finished}
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                  title="Selesai"
                >
                  <Check size={14} />
                </span>
              {/if}

              {#if isOwner}
                <button
                  type="button"
                  aria-label="Ubah konten"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                  onclick={() => openEditContent(content)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Hapus konten"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  onclick={() => handleDeleteContent(content)}
                >
                  <Trash2 size={16} />
                </button>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    {#if !canOpenContent && detail.contents.length > 0}
      <p class="mt-3 text-xs text-slate-500">
        Ikuti kursus ini untuk membuka materi.
      </p>
    {/if}
  </section>

  <!-- Rating -->
  <section class="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h2 class="mb-4 text-lg font-bold text-slate-900">Rating</h2>

    {#if isStudent && !isOwner}
      <form onsubmit={handleSubmitRating} class="mb-6 space-y-3">
        <div class="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {#each [1, 2, 3, 4, 5] as value (value)}
            <button
              type="button"
              role="radio"
              aria-checked={myRating === value}
              aria-label={`${value} bintang`}
              onclick={() => (myRating = value as 1 | 2 | 3 | 4 | 5)}
            >
              <Star
                size={26}
                class={value <= myRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"}
              />
            </button>
          {/each}
        </div>

        <textarea
          rows="3"
          required
          placeholder="Tulis ulasanmu..."
          bind:value={myComment}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        ></textarea>

        <button
          type="submit"
          disabled={busy}
          class="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Kirim rating
        </button>
      </form>
    {/if}

    {#if detail.ratings.length === 0}
      <p class="text-sm text-slate-500">Belum ada rating.</p>
    {:else}
      <ul class="space-y-3">
        {#each detail.ratings as rating, i (i)}
          <li class="rounded-xl border border-slate-200 p-3">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-900">{rating.name}</span>
              <span class="flex items-center gap-1 text-sm text-slate-600">
                <Star size={14} class="fill-amber-400 text-amber-400" />
                {rating.ratings}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-600">{rating.comment}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <ChangeModal open={showEdit} course={detail} onclose={() => (showEdit = false)} />
  <ChangeCoverModal
    open={showCover}
    courseId={detail.id}
    onclose={() => (showCover = false)}
  />
  <ContentModal
    open={showContent}
    courseId={detail.id}
    content={editingContent}
    onclose={() => (showContent = false)}
  />
{/if}
