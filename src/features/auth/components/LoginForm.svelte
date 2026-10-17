<script lang="ts">
  import { goto } from "$app/navigation";
  import { authApi } from "../api/authApi";
  import { userApi } from "../../users/api/userApi";
  import { setAuthLogin } from "../states/authStore";
  import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import { useInput } from "../../../hooks/useInput";

  const { value: email, onChange: onEmail } = useInput("");
  const { value: password, onChange: onPassword } = useInput("");
  let loading = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    try {
      const { token } = await authApi.login({
        email: $email,
        password: $password,
      });

      // Token harus tersimpan dulu agar permintaan profil membawa header Authorization.
      putAccessToken(token);
      const profile = await userApi.getProfile();

      setAuthLogin(token, profile);
      goto("/");
    } catch (error) {
      removeAccessToken();
      showErrorDialog((error as Error).message);
    } finally {
      loading = false;
    }
  }
</script>

<h2 class="mb-6 text-xl font-bold text-slate-900">Masuk</h2>

<form onsubmit={handleSubmit} class="space-y-4">
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
    {loading ? "Memproses..." : "Masuk"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Belum punya akun?
  <a href="/auth/register" class="font-semibold text-indigo-600 hover:underline">
    Daftar
  </a>
</p>
