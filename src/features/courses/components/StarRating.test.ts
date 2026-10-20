import { screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import StarRating from "./StarRating.svelte";

describe("StarRating", () => {
  it("menandai bintang sampai nilai yang dipilih", async () => {
    renderWithProviders(StarRating, { props: { value: 0 } });
    const pressed = () =>
      [1, 2, 3, 4, 5].map((n) => screen.getByRole("button", { name: `${n} bintang` }).getAttribute("aria-pressed"));
    expect(pressed()).toEqual(["false", "false", "false", "false", "false"]);
    screen.getByRole("button", { name: "3 bintang" }).click();
    await tick();
    expect(pressed()).toEqual(["true", "true", "true", "false", "false"]);
  });

  it("memakai nilai awal default bila tidak diberikan props", () => {
    renderWithProviders(StarRating);
    const pressed = [1, 2, 3, 4, 5].map((n) =>
      screen.getByRole("button", { name: `${n} bintang` }).getAttribute("aria-pressed"),
    );
    expect(pressed).toEqual(["false", "false", "false", "false", "false"]);
  });
});
