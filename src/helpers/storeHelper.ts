import type { Writable } from "svelte/store";

/** Menyalakan bendera `true` selama `task` berjalan, lalu mematikannya lagi. */
export async function withFlag<T>(
  flag: Writable<boolean>,
  task: () => Promise<T>,
): Promise<T> {
  flag.set(true);
  try {
    return await task();
  } finally {
    flag.set(false);
  }
}
