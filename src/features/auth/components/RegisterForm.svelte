<script lang="ts">
  import { goto } from "$app/navigation";
  import { authApi } from "../api/authApi";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";
  import { useInput } from "../../../hooks/useInput";

  const { value: name, onChange: onName } = useInput("");
  const { value: email, onChange: onEmail } = useInput("");
  const { value: password, onChange: onPassword } = useInput("");
  let loading = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    try {
      const response = await authApi.register({
        name: $name,
        email: $email,
        password: $password,
      });
      await showSuccessDialog(response.message);
      goto("/auth/login");
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      loading = false;
    }
  }
</script>

<h2 class="mb-6 text-xl font-bold text-slate-900">Daftar</h2>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="name" class="mb-1 block text-sm font-medium text-slate-700">
      Nama
    </label>
    <input
      id="name"
      type="text"
      required
      value={$name}
      oninput={onName}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    />
  </div>

  <div>
    <label for="email" class="mb-1 block text-sm font-medium text-slate-700">
      Email
    </label>
    <input
      id="email"
      type="email"
      required
      value={$email}
      oninput={onEmail}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    />
  </div>

  <div>
    <label for="password" class="mb-1 block text-sm font-medium text-slate-700">
      Kata sandi
    </label>
    <input
      id="password"
      type="password"
      required
      value={$password}
      oninput={onPassword}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    class="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    {loading ? "Memproses..." : "Daftar"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Sudah punya akun?
  <a href="/auth/login" class="font-semibold text-indigo-600 hover:underline">
    Masuk
  </a>
</p>
