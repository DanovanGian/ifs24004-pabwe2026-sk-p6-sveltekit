import { get, writable } from "svelte/store";
import { describe, expect, it } from "vitest";
import { withFlag } from "./storeHelper";

describe("withFlag", () => {
  it("menyalakan bendera selama task berjalan lalu mematikannya", async () => {
    const flag = writable(false);
    let during = false;
    const result = await withFlag(flag, async () => {
      during = get(flag);
      return 42;
    });
    expect(result).toBe(42);
    expect(during).toBe(true);
    expect(get(flag)).toBe(false);
  });

  it("tetap mematikan bendera saat task gagal", async () => {
    const flag = writable(false);
    await expect(
      withFlag(flag, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(get(flag)).toBe(false);
  });
});
