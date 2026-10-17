import { writable } from "svelte/store";

export function useInput(initialValue = "") {
  const value = writable(initialValue);

  const onChange = (event: Event) => {
    value.set((event.target as HTMLInputElement).value);
  };

  const reset = () => value.set(initialValue);

  return { value, onChange, reset };
}
