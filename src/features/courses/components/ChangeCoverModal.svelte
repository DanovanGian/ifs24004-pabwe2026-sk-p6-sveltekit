<script lang="ts">
  import Modal from "../../common/components/Modal.svelte";
  import { changeCover } from "../states/coursesStore";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  interface Props {
    open: boolean;
    courseId: number | string;
    onclose?: () => void;
  }

  let { open, courseId, onclose = () => {} }: Props = $props();

  let cover = $state<File | null>(null);
  let preview = $state<string | null>(null);
  let saving = $state(false);

  function handleFile(event: Event) {
    cover = (event.currentTarget as HTMLInputElement).files?.[0] ?? null;
    preview = cover ? URL.createObjectURL(cover) : null;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!cover) return;

    saving = true;
    try {
      await changeCover(courseId, cover);
      cover = null;
      preview = null;
      onclose();
      await showSuccessDialog("Sampul kursus berhasil diubah");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      saving = false;
    }
  }
</script>

<Modal {open} title="Ganti Sampul" {onclose}>
  <form onsubmit={handleSubmit} class="space-y-4">
    {#if preview}
      <img src={preview} alt="Pratinjau sampul" class="h-44 w-full rounded-lg object-cover" />
    {/if}

    <input
      type="file"
      accept="image/*"
      required
      aria-label="Berkas sampul"
      onchange={handleFile}
      class="w-full text-sm text-slate-600"
    />

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
        disabled={saving || !cover}
        class="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  </form>
</Modal>
