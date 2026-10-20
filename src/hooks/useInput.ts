import { writable } from "svelte/store";

/** Hook input formulir: store nilai + fungsi reset ke nilai awal. */
export function useInput(initial: string) {
  const value = writable(initial);
  return {
    value,
    reset: () => value.set(initial),
  };
}
