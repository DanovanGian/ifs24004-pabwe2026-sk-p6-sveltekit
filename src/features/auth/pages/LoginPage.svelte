<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { isSuccess } from "../../../helpers/apiHelper";
  import { getErrorMessage, showErrorDialog } from "../../../helpers/toolsHelper";
  import { isAuthLoading, login } from "../states/authStore";

  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const response = await login($email, $password);
    if (!isSuccess(response)) {
      await showErrorDialog(getErrorMessage(response));
    }
  }
</script>

<h1 class="text-3xl font-extrabold text-slate-900">Masuk</h1>
<p class="mt-2 mb-8 text-slate-600">Masuk untuk mulai belajar.</p>

<form class="space-y-5" onsubmit={handleSubmit} novalidate>
  <div>
    <label for="login-email-input" class="mb-1 block text-sm font-medium">Email</label>
    <input name="email"
      id="login-email-input"
      type="email"
      bind:value={$email}
      class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
    />
  </div>
  <div>
    <label for="login-password-input" class="mb-1 block text-sm font-medium">
      Kata Sandi
    </label>
    <input name="password"
      id="login-password-input"
      type="password"
      bind:value={$password}
      class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
    />
  </div>
  <button
    id="login-submit-button"
    type="submit"
    disabled={$isAuthLoading}
    class="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    Masuk
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-600">
  Belum punya akun?
  <a href="/auth/register" class="font-semibold text-indigo-600">Daftar</a>
</p>
