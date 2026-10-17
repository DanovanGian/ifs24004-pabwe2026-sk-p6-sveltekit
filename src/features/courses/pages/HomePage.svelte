<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Search, Trash2 } from "lucide-svelte";
  import CourseCard from "../components/CourseCard.svelte";
  import AddModal from "../components/AddModal.svelte";
  import type { Course } from "../api/courseApi";
  import {
    courses,
    isCoursesLoading,
    fetchCourses,
    deleteCourse,
    deleteAllCourses,
    resetMutationFlags,
  } from "../states/coursesStore";
  import { authProfile } from "../../auth/states/authStore";
  import {
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  let search = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const filtered = $derived(
    $courses.filter((course) => {
      const keyword = search.trim().toLowerCase();
      if (!keyword) return true;
      return (
        course.title.toLowerCase().includes(keyword) ||
        course.description.toLowerCase().includes(keyword) ||
        course.author.name.toLowerCase().includes(keyword)
      );
    })
  );

  const hasOwnCourses = $derived(
    $courses.some((course) => course.user_id === $authProfile?.id)
  );

  async function load() {
    try {
      await fetchCourses(onlyMine);
    } catch (error) {
      showErrorDialog((error as Error).message);
    }
  }

  onMount(() => {
    resetMutationFlags();
    load();
  });

  function handleToggleMine(event: Event) {
    onlyMine = (event.currentTarget as HTMLInputElement).checked;
    load();
  }

  async function handleDelete(course: Course) {
    const confirmed = await showConfirmDialog(
      "Hapus kursus",
      `Yakin ingin menghapus "${course.title}"?`
    );
    if (!confirmed) return;

    try {
      await deleteCourse(course.id);
      await showSuccessDialog("Kursus berhasil dihapus");
    } catch (error) {
      showErrorDialog((error as Error).message);
    }
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog(
      "Hapus semua kursus saya",
      "Semua kursus buatanmu beserta konten dan sampulnya akan dihapus permanen."
    );
    if (!confirmed) return;

    try {
      await deleteAllCourses();
      await showSuccessDialog("Semua kursus berhasil dihapus");
    } catch (error) {
      showErrorDialog((error as Error).message);
    }
  }
</script>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900">Semua Kursus</h1>
    <p class="text-sm text-slate-500">Temukan kursus atau buat kursusmu sendiri.</p>
  </div>

  <button
    type="button"
    class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
    onclick={() => (showAdd = true)}
  >
    <Plus size={18} />
    Tambah Kursus
  </button>
</div>

<div class="mb-6 flex flex-wrap items-center gap-4">
  <div class="relative min-w-60 flex-1">
    <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="search"
      placeholder="Cari judul, deskripsi, atau penulis..."
      bind:value={search}
      class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    />
  </div>

  <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
    <input
      type="checkbox"
      checked={onlyMine}
      onchange={handleToggleMine}
      class="h-4 w-4 rounded border-slate-300 text-indigo-600"
    />
    Milik saya
  </label>

  {#if onlyMine && hasOwnCourses}
    <button
      type="button"
      class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
      onclick={handleDeleteAll}
    >
      <Trash2 size={16} />
      Hapus semua milik saya
    </button>
  {/if}
</div>

{#if $isCoursesLoading && $courses.length === 0}
  <p class="text-slate-500">Memuat data...</p>
{:else if filtered.length === 0}
  <p class="text-slate-500">Tidak ada kursus yang ditemukan.</p>
{:else}
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each filtered as course (course.id)}
      <CourseCard
        {course}
        isOwner={course.user_id === $authProfile?.id}
        ondelete={handleDelete}
      />
    {/each}
  </div>
{/if}

<AddModal open={showAdd} onclose={() => (showAdd = false)} />
