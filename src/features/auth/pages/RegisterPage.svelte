<script lang="ts">
  import { goto } from "$app/navigation";
  import { useInput } from "../../../hooks/useInput";
  import { runWithFeedback } from "../../../helpers/toolsHelper";
  import { isAuthLoading, register } from "../states/authStore";

  const { value: name } = useInput("");
  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await runWithFeedback(
      () => register($name, $email, $password),
      () => goto("/auth/login"),
    );
  }
</script>

<h1 class="text-3xl font-extrabold text-slate-900">Daftar</h1>
<p class="mt-2 mb-8 text-slate-600">Buat akun untuk mengikuti kursus.</p>

<form class="space-y-5" onsubmit={handleSubmit} novalidate>
  <div>
    <label for="name" class="mb-1 block text-sm font-medium">Nama</label>
    <input name="name"
      id="name"
      type="text"
      bind:value={$name}
      class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
    />
  </div>
  <div>
    <label for="email" class="mb-1 block text-sm font-medium">Email</label>
    <input name="email"
      id="email"
      type="email"
      bind:value={$email}
      class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
    />
  </div>
  <div>
    <label for="password" class="mb-1 block text-sm font-medium">
      Kata Sandi
    </label>
    <input name="password"
      id="password"
      type="password"
      bind:value={$password}
      class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
    />
  </div>
  <button
    type="submit"
    disabled={$isAuthLoading}
    class="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    Daftar
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-600">
  Sudah punya akun?
  <a href="/auth/login" class="font-semibold text-indigo-600">Masuk</a>
</p>
