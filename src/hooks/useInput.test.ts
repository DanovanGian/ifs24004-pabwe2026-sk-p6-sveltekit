import { get } from "svelte/store";
import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("menyimpan nilai dan bisa direset ke nilai awal", () => {
    const input = useInput("awal");
    expect(get(input.value)).toBe("awal");
    input.value.set("baru");
    expect(get(input.value)).toBe("baru");
    input.reset();
    expect(get(input.value)).toBe("awal");
  });
});
