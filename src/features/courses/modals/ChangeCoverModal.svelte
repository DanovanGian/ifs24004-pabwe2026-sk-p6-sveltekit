<script lang="ts">
  import { runWithFeedback, showWarningDialog } from "../../../helpers/toolsHelper";
  import ModalShell from "../components/ModalShell.svelte";
  import { changeCover, isChangingCover } from "../states/coursesStore";

  let {
    courseId,
    onClose,
    onSaved,
  }: {
    courseId: number;
    onClose: () => void;
    onSaved: () => unknown;
  } = $props();

  let file: File | undefined = $state();

  function handleFile(event: Event) {
    file = (event.currentTarget as HTMLInputElement).files[0];
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!file) {
      await showWarningDialog("Pilih berkas sampul terlebih dahulu.");
      return;
    }
    await runWithFeedback(
      () => changeCover(courseId, file),
      () => {
        onSaved();
        onClose();
      },
    );
  }
</script>

<ModalShell title="Ubah Sampul" {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <input name="cover"
      type="file"
      accept="image/*"
      aria-label="Berkas sampul"
      onchange={handleFile}
      class="w-full rounded-xl border border-slate-300 px-4 py-3"
    />
    <div class="flex justify-end gap-3">
      <button type="button" onclick={onClose} class="rounded-xl px-4 py-2">
        Batal
      </button>
      <button
        type="submit"
        disabled={$isChangingCover}
        class="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        Unggah
      </button>
    </div>
  </form>
</ModalShell>
