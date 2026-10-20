<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { runWithFeedback } from "../../../helpers/toolsHelper";
  import ModalShell from "../components/ModalShell.svelte";
  import { addCourse, isAdding } from "../states/coursesStore";

  let { onClose, onSaved }: { onClose: () => void; onSaved: () => unknown } =
    $props();

  const { value: title } = useInput("");
  const { value: description } = useInput("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await runWithFeedback(
      () => addCourse($title, $description),
      () => {
        onSaved();
        onClose();
      },
    );
  }
</script>

<ModalShell title="Tambah Kursus" {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <div>
      <label for="add-title" class="mb-1 block text-sm font-medium">Judul</label>
      <input name="title"
        id="add-title"
        type="text"
        bind:value={$title}
        class="w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
    <div>
      <label for="add-description" class="mb-1 block text-sm font-medium">
        Deskripsi
      </label>
      <textarea name="description"
        id="add-description"
        rows="4"
        bind:value={$description}
        class="w-full rounded-xl border border-slate-300 px-4 py-3"
      ></textarea>
    </div>
    <div class="flex justify-end gap-3">
      <button type="button" onclick={onClose} class="rounded-xl px-4 py-2">
        Batal
      </button>
      <button
        type="submit"
        disabled={$isAdding}
        class="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        Simpan
      </button>
    </div>
  </form>
</ModalShell>
