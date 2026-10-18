<script lang="ts">
  import Modal from "../../common/components/Modal.svelte";
  import { addContent, updateContent } from "../states/coursesStore";
  import type { CourseContent } from "../api/courseApi";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  interface Props {
    open: boolean;
    courseId: number | string;
    content?: CourseContent | null; // diisi saat mengubah, kosong saat menambah
    onclose?: () => void;
  }

  let { open, courseId, content = null, onclose = () => {} }: Props = $props();

  let title = $state("");
  let youtube = $state("");
  let saving = $state(false);

  const isEdit = $derived(content !== null);

  $effect(() => {
    if (open) {
      title = content?.title ?? "";
      youtube = content?.youtube ?? "";
    }
  });

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    try {
      if (content) {
        await updateContent(courseId, content.id, { title, youtube });
      } else {
        await addContent(courseId, { title, youtube });
      }
      onclose();
      await showSuccessDialog(
        isEdit ? "Konten berhasil diubah" : "Konten berhasil ditambahkan"
      );
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      saving = false;
    }
  }
</script>

<Modal {open} title={isEdit ? "Ubah Konten" : "Tambah Konten"} {onclose}>
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="ct-title" class="mb-1 block text-sm font-medium text-slate-700">
        Judul materi
      </label>
      <input id="ct-title" type="text" required bind:value={title} class={inputClass} />
    </div>

    <div>
      <label for="ct-yt" class="mb-1 block text-sm font-medium text-slate-700">
        Tautan YouTube
      </label>
      <input
        id="ct-yt"
        type="url"
        required
        placeholder="https://youtu.be/..."
        bind:value={youtube}
        class={inputClass}
      />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
        onclick={onclose}
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={saving}
        class="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>
