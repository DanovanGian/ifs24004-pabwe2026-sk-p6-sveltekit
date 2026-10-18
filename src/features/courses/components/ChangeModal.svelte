<script lang="ts">
  import Modal from "../../common/components/Modal.svelte";
  import { updateCourse } from "../states/coursesStore";
  import type { CourseDetail } from "../api/courseApi";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  interface Props {
    open: boolean;
    course: CourseDetail;
    onclose?: () => void;
  }

  let { open, course, onclose = () => {} }: Props = $props();

  let title = $state("");
  let description = $state("");
  let saving = $state(false);

  // Isi ulang form dengan data terbaru setiap kali modal dibuka.
  $effect(() => {
    if (open) {
      title = course.title;
      description = course.description;
    }
  });

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    try {
      await updateCourse(course.id, { title, description });
      onclose();
      await showSuccessDialog("Data kursus berhasil diubah");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      saving = false;
    }
  }
</script>

<Modal {open} title="Ubah Data Kursus" {onclose}>
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="chg-title" class="mb-1 block text-sm font-medium text-slate-700">
        Judul
      </label>
      <input id="chg-title" type="text" required bind:value={title} class={inputClass} />
    </div>

    <div>
      <label for="chg-desc" class="mb-1 block text-sm font-medium text-slate-700">
        Deskripsi
      </label>
      <textarea
        id="chg-desc"
        rows="4"
        required
        bind:value={description}
        class={inputClass}
      ></textarea>
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
