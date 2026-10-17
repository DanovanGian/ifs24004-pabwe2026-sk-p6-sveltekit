<script lang="ts">
  import { onMount } from "svelte";
  import { userApi, type User } from "../api/userApi";
  import Avatar from "../../common/components/Avatar.svelte";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  let users = $state<User[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      users = await userApi.getUsers();
    } catch (error) {
      showErrorDialog((error as Error).message);
    } finally {
      loading = false;
    }
  });
</script>

<div class="mb-6">
  <h1 class="text-2xl font-extrabold text-slate-900">Pengguna</h1>
  <p class="text-sm text-slate-500">Daftar pengguna yang terdaftar di Delcom.</p>
</div>

{#if loading}
  <p class="text-slate-500">Memuat data...</p>
{:else if users.length === 0}
  <p class="text-slate-500">Belum ada pengguna.</p>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each users as user (user.id)}
      <div
        class="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <Avatar name={user.name} photo={user.photo} class="h-12 w-12" />
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{user.name}</p>
          <p class="truncate text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
    {/each}
  </div>
{/if}
