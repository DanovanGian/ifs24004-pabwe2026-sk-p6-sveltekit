<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import {
    getPhotoUrl,
    runWithFeedback,
    showWarningDialog,
  } from "../../../helpers/toolsHelper";
  import { authProfile } from "../../auth/states/authStore";
  import {
    isPasswordSaving,
    isPhotoSaving,
    isProfileSaving,
    updatePassword,
    updatePhoto,
    updateProfile,
  } from "../states/usersStore";

  // Layout memastikan profil sudah dimuat sebelum halaman ini tampil.
  const { value: name } = useInput($authProfile.name);
  const { value: email } = useInput($authProfile.email);
  const { value: currentPassword, reset: resetCurrent } = useInput("");
  const { value: newPassword, reset: resetNew } = useInput("");
  const { value: confirmation, reset: resetConfirmation } = useInput("");

  let photoFile: File | undefined = $state();

  function handleFile(event: Event) {
    photoFile = (event.currentTarget as HTMLInputElement).files[0];
  }

  async function saveProfile(event: SubmitEvent) {
    event.preventDefault();
    await runWithFeedback(() => updateProfile($name, $email), () => {});
  }

  async function savePhoto(event: SubmitEvent) {
    event.preventDefault();
    if (!photoFile) {
      await showWarningDialog("Pilih foto terlebih dahulu.");
      return;
    }
    await runWithFeedback(() => updatePhoto(photoFile), () => {});
  }

  function clearPasswords() {
    resetCurrent();
    resetNew();
    resetConfirmation();
  }

  async function savePassword(event: SubmitEvent) {
    event.preventDefault();
    await runWithFeedback(
      () => updatePassword($currentPassword, $newPassword, $confirmation),
      clearPasswords,
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none";
</script>

<div class="space-y-8">
  <div class="flex items-center gap-5">
    <img
      src={getPhotoUrl($authProfile.photo, $authProfile.name)}
      alt="Foto profil"
      width="80"
      height="80"
      decoding="async"
      class="h-20 w-20 rounded-full object-cover"
    />
    <div>
      <h1 class="text-2xl font-extrabold">{$authProfile.name}</h1>
      <p class="text-slate-600">{$authProfile.email}</p>
    </div>
  </div>

  <section class="max-w-xl rounded-2xl bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-bold">Ubah Data</h2>
    <form class="space-y-4" onsubmit={saveProfile} novalidate>
      <div>
        <label for="profile-name" class="mb-1 block text-sm font-medium">Nama</label>
        <input name="name" id="profile-name" type="text" bind:value={$name} class={inputClass} />
      </div>
      <div>
        <label for="profile-email" class="mb-1 block text-sm font-medium">Email</label>
        <input name="email" id="profile-email" type="email" bind:value={$email} class={inputClass} />
      </div>
      <button
        type="submit"
        disabled={$isProfileSaving}
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        Simpan
      </button>
    </form>
  </section>

  <section class="max-w-xl rounded-2xl bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-bold">Ubah Foto</h2>
    <form class="space-y-4" onsubmit={savePhoto} novalidate>
      <input name="photo"
        type="file"
        accept="image/*"
        aria-label="Berkas foto"
        onchange={handleFile}
        class={inputClass}
      />
      <button
        type="submit"
        disabled={$isPhotoSaving}
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        Unggah Foto
      </button>
    </form>
  </section>

  <section class="max-w-xl rounded-2xl bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-bold">Ubah Kata Sandi</h2>
    <form class="space-y-4" onsubmit={savePassword} novalidate>
      <div>
        <label for="current-password" class="mb-1 block text-sm font-medium">
          Kata Sandi Saat Ini
        </label>
        <input name="current_password" id="current-password" type="password" bind:value={$currentPassword} class={inputClass} />
      </div>
      <div>
        <label for="new-password" class="mb-1 block text-sm font-medium">
          Kata Sandi Baru
        </label>
        <input name="new_password" id="new-password" type="password" bind:value={$newPassword} class={inputClass} />
      </div>
      <div>
        <label for="confirm-password" class="mb-1 block text-sm font-medium">
          Konfirmasi Kata Sandi Baru
        </label>
        <input name="password_confirmation" id="confirm-password" type="password" bind:value={$confirmation} class={inputClass} />
      </div>
      <button
        type="submit"
        disabled={$isPasswordSaving}
        class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        Ubah Kata Sandi
      </button>
    </form>
  </section>
</div>
