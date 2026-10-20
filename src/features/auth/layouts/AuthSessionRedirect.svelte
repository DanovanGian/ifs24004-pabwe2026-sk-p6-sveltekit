<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    authProfile,
    authToken,
    isSessionReady,
    loadProfile,
  } from "../states/authStore";

  // Token lama di localStorage: muat profil dulu, baru arahkan ke beranda.
  onMount(() => {
    if ($authToken && !$authProfile) {
      loadProfile();
    }
  });

  // Pengalihan hanya terjadi saat token, status login, dan profil sama-sama siap.
  $effect(() => {
    if ($isSessionReady) {
      goto("/");
    }
  });
</script>
