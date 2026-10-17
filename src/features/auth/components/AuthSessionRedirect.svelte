<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    authToken,
    isAuthenticated,
    authProfile,
    isProfile,
  } from "../states/authStore";

  // Siap hanya bila token, status login, dan profil sudah ada, dan profil tidak sedang dimuat.
  const ready = $derived(
    Boolean($authToken && $isAuthenticated && $authProfile && !$isProfile)
  );

  $effect(() => {
    if (ready) {
      goto("/");
    }
  });
</script>
