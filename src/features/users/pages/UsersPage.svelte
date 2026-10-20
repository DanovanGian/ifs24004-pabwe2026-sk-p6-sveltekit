<script lang="ts">
  import { onMount } from "svelte";
  import { Search } from "lucide-svelte";
  import { getPhotoUrl } from "../../../helpers/toolsHelper";
  import { isUsersLoading, loadUsers, users } from "../states/usersStore";

  let query = $state("");

  const keyword = $derived(query.toLowerCase());
  const filtered = $derived(
    $users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword),
    ),
  );

  onMount(() => {
    loadUsers();
  });
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-extrabold">Pengguna</h1>
    <p class="text-slate-600">Direktori pengguna Delcom Courses.</p>
  </div>

  <div class="relative max-w-md">
    <Search class="absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
    <input name="query"
      type="search"
      aria-label="Cari pengguna"
      placeholder="Cari nama atau email"
      bind:value={query}
      class="w-full rounded-xl border border-slate-300 py-3 pr-4 pl-9"
    />
  </div>

  {#if $isUsersLoading}
    <p class="text-slate-600">Memuat pengguna...</p>
  {:else if filtered.length === 0}
    <p class="text-slate-600">Pengguna tidak ditemukan.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as user (user.id)}
        <li class="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <img
            src={getPhotoUrl(user.photo, user.name)}
            alt={user.name}
            width="48"
            height="48"
            loading="lazy"
            decoding="async"
            class="h-12 w-12 rounded-full object-cover"
          />
          <div class="min-w-0">
            <p class="truncate font-semibold">{user.name}</p>
            <p class="truncate text-sm text-slate-600">{user.email}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
