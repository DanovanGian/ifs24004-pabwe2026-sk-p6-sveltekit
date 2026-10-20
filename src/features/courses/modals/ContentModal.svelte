<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { runWithFeedback } from "../../../helpers/toolsHelper";
  import ModalShell from "../components/ModalShell.svelte";
  import {
    addContent,
    changeContent,
    isContentMutating,
  } from "../states/coursesStore";

  // `content` bernilai null saat menambah materi baru.
  let {
    courseId,
    content,
    onClose,
    onSaved,
  }: {
    courseId: number;
    content: CourseContent | null;
    onClose: () => void;
    onSaved: () => unknown;
  } = $props();

  const { value: title } = useInput(content ? content.title : "");
  const { value: youtube } = useInput(content ? content.youtube : "");

  const save = () =>
    content
      ? changeContent(content.id, $title, $youtube)
      : addContent(courseId, $title, $youtube);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await runWithFeedback(save, () => {
      onSaved();
      onClose();
    });
  }
</script>

<ModalShell title={content ? "Ubah Materi" : "Tambah Materi"} {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <div>
      <label for="content-title" class="mb-1 block text-sm font-medium">Judul</label>
      <input name="title"
        id="content-title"
        type="text"
        bind:value={$title}
        class="w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
    <div>
      <label for="content-youtube" class="mb-1 block text-sm font-medium">
        Tautan YouTube
      </label>
      <input name="youtube"
        id="content-youtube"
        type="url"
        bind:value={$youtube}
        class="w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
    <div class="flex justify-end gap-3">
      <button type="button" onclick={onClose} class="rounded-xl px-4 py-2">
        Batal
      </button>
      <button
        type="submit"
        disabled={$isContentMutating}
        class="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        Simpan
      </button>
    </div>
  </form>
</ModalShell>
