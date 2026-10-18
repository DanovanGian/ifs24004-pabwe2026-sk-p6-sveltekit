import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("memakai string kosong sebagai nilai awal bawaan", () => {
    const { value } = useInput();
    expect(get(value)).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const { value } = useInput("halo");
    expect(get(value)).toBe("halo");
  });

  it("onChange memperbarui nilai dari event input", () => {
    const { value, onChange } = useInput();
    onChange({ target: { value: "baru" } } as unknown as Event);
    expect(get(value)).toBe("baru");
  });

  it("reset mengembalikan nilai awal", () => {
    const { value, onChange, reset } = useInput("awal");
    onChange({ target: { value: "ubah" } } as unknown as Event);
    reset();
    expect(get(value)).toBe("awal");
  });
});
