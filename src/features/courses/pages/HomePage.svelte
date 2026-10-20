<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Search, Trash2 } from "lucide-svelte";
  import {
    runWithFeedback,
    showConfirmDialog,
  } from "../../../helpers/toolsHelper";
  import CourseCard from "../components/CourseCard.svelte";
  import AddModal from "../modals/AddModal.svelte";
  import {
    courses,
    isCoursesLoading,
    isDeletingAll,
    loadCourses,
    removeAllCourses,
  } from "../states/coursesStore";

  let query = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const keyword = $derived(query.toLowerCase());
  const filtered = $derived(
    $courses.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword),
    ),
  );

  const reload = () => loadCourses(onlyMine);
  const openAdd = () => (showAdd = true);
  const closeAdd = () => (showAdd = false);

  onMount(() => {
    loadCourses(false);
  });

  function toggleMine(event: Event) {
    onlyMine = (event.currentTarget as HTMLInputElement).checked;
    reload();
  }

  async function deleteAll() {
    if (await showConfirmDialog("Hapus semua kursus milikmu? Tindakan ini tidak dapat dibatalkan.")) {
      await runWithFeedback(() => removeAllCourses(), reload);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold">Semua Kursus</h1>
      <p class="text-slate-600">Temukan kursus dan mulai belajar.</p>
    </div>
    <div class="flex gap-3">
      <button
        type="button"
        onclick={deleteAll}
        disabled={$isDeletingAll}
        class="flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-700 disabled:opacity-60"
      >
        <Trash2 class="h-4 w-4" /> Hapus Semua Milikku
      </button>
      <button
        type="button"
        onclick={openAdd}
        class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white"
      >
        <Plus class="h-4 w-4" /> Tambah Kursus
      </button>
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-4">
    <div class="relative w-full max-w-md">
      <Search class="absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
      <input name="query"
        type="search"
        aria-label="Cari kursus"
        placeholder="Cari judul atau deskripsi"
        bind:value={query}
        class="w-full rounded-xl border border-slate-300 py-3 pr-4 pl-9"
      />
    </div>
    <label class="flex items-center gap-2 text-sm font-medium">
      <input name="only_mine" type="checkbox" checked={onlyMine} onchange={toggleMine} />
      Kursus milik saya
    </label>
  </div>

  {#if $isCoursesLoading}
    <p class="text-slate-600">Memuat kursus...</p>
  {:else if filtered.length === 0}
    <p class="text-slate-600">Kursus tidak ditemukan.</p>
  {:else}
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as item (item.id)}
        <CourseCard course={item} />
      {/each}
    </div>
  {/if}
</div>

{#if showAdd}
  <AddModal onClose={closeAdd} onSaved={reload} />
{/if}
