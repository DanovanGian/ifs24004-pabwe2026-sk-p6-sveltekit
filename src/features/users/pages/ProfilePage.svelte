<script lang="ts">
  import { userApi } from "../api/userApi";
  import { authProfile } from "../../auth/states/authStore";
  import Avatar from "../../common/components/Avatar.svelte";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";

  let name = $state("");
  let email = $state("");
  let savingProfile = $state(false);

  let password = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let savingPassword = $state(false);

  let uploading = $state(false);

  // Isi form saat profil tersedia (profil bisa tiba setelah halaman tampil).
  $effect(() => {
    if ($authProfile) {
      name = $authProfile.name;
      email = $authProfile.email;
    }
  });

  async function handleUpdateProfile(event: SubmitEvent) {
    event.preventDefault();
    savingProfile = true;
    try {
      const user = await userApi.updateProfile({ name, email });
      authProfile.set(user);
      await showSuccessDialog("Profil berhasil diperbarui");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      savingProfile = false;
    }
  }

  async function handlePhotoChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    try {
      await userApi.changePhoto(file);
      authProfile.set(await userApi.getProfile());
      await showSuccessDialog("Foto profil berhasil diperbarui");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      uploading = false;
      input.value = "";
    }
  }

  async function handleChangePassword(event: SubmitEvent) {
    event.preventDefault();
    savingPassword = true;
    try {
      await userApi.changePassword({
        password,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      password = newPassword = confirmPassword = "";
      await showSuccessDialog("Kata sandi berhasil diubah");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      savingPassword = false;
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
</script>

<h1 class="mb-6 text-2xl font-extrabold text-slate-900">Profil</h1>

<div class="grid gap-6 lg:grid-cols-2">
  <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div class="mb-6 flex items-center gap-4">
      <Avatar
        name={$authProfile?.name}
        photo={$authProfile?.photo}
        class="h-20 w-20 text-2xl"
      />
      <div>
        <label
          class="cursor-pointer rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
        >
          {uploading ? "Mengunggah..." : "Ganti foto"}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            disabled={uploading}
            onchange={handlePhotoChange}
          />
        </label>
      </div>
    </div>

    <form onsubmit={handleUpdateProfile} class="space-y-4">
      <div>
        <label for="p-name" class="mb-1 block text-sm font-medium text-slate-700">
          Nama
        </label>
        <input id="p-name" type="text" required bind:value={name} class={inputClass} />
      </div>
      <div>
        <label for="p-email" class="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input id="p-email" type="email" required bind:value={email} class={inputClass} />
      </div>
      <button
        type="submit"
        disabled={savingProfile}
        class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {savingProfile ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  </section>

  <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h2 class="mb-4 text-lg font-bold text-slate-900">Ubah kata sandi</h2>
    <form onsubmit={handleChangePassword} class="space-y-4">
      <div>
        <label for="pw-old" class="mb-1 block text-sm font-medium text-slate-700">
          Kata sandi saat ini
        </label>
        <input id="pw-old" type="password" required bind:value={password} class={inputClass} />
      </div>
      <div>
        <label for="pw-new" class="mb-1 block text-sm font-medium text-slate-700">
          Kata sandi baru
        </label>
        <input id="pw-new" type="password" required bind:value={newPassword} class={inputClass} />
      </div>
      <div>
        <label for="pw-confirm" class="mb-1 block text-sm font-medium text-slate-700">
          Konfirmasi kata sandi baru
        </label>
        <input id="pw-confirm" type="password" required bind:value={confirmPassword} class={inputClass} />
      </div>
      <button
        type="submit"
        disabled={savingPassword}
        class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {savingPassword ? "Menyimpan..." : "Ubah kata sandi"}
      </button>
    </form>
  </section>
</div>
