<script lang="ts">
  import Modal from "../../common/components/Modal.svelte";
  import { addCourse } from "../states/coursesStore";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  interface Props {
    open: boolean;
    onclose?: () => void;
  }

  let { open, onclose = () => {} }: Props = $props();

  let title = $state("");
  let description = $state("");
  let cover = $state<File | null>(null);
  let saving = $state(false);

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  function handleCover(event: Event) {
    cover = (event.currentTarget as HTMLInputElement).files?.[0] ?? null;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    try {
      await addCourse({ title, description }, cover);
      title = "";
      description = "";
      cover = null;
      onclose();
      await showSuccessDialog("Kursus berhasil ditambahkan");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      saving = false;
    }
  }
</script>

<Modal {open} title="Tambah Kursus" {onclose}>
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="add-title" class="mb-1 block text-sm font-medium text-slate-700">
        Judul
      </label>
      <input id="add-title" type="text" required bind:value={title} class={inputClass} />
    </div>

    <div>
      <label for="add-desc" class="mb-1 block text-sm font-medium text-slate-700">
        Deskripsi
      </label>
      <textarea
        id="add-desc"
        rows="4"
        required
        bind:value={description}
        class={inputClass}
      ></textarea>
    </div>

    <div>
      <label for="add-cover" class="mb-1 block text-sm font-medium text-slate-700">
        Sampul (opsional)
      </label>
      <input
        id="add-cover"
        type="file"
        accept="image/*"
        onchange={handleCover}
        class="w-full text-sm text-slate-600"
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
