import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import Avatar from "./Avatar.svelte";

describe("Avatar", () => {
  it("menampilkan gambar bila foto tersedia", () => {
    render(Avatar, { props: { name: "Budi", photo: "https://x.test/a.png" } });

    const img = screen.getByAltText("Budi");
    expect(img).toHaveAttribute("src", "https://x.test/a.png");
  });

  it("menyusun URL dari path relatif", () => {
    render(Avatar, { props: { name: "Budi", photo: "img/profile/1.png" } });

    expect(screen.getByAltText("Budi").getAttribute("src")).toContain(
      "/img/profile/1.png"
    );
  });

  it("menampilkan huruf pertama nama bila tanpa foto", () => {
    render(Avatar, { props: { name: "budi", photo: null } });

    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByAltText("budi")).not.toBeInTheDocument();
  });

  it("menampilkan tanda tanya bila nama kosong", () => {
    render(Avatar);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("beralih ke huruf pertama saat gambar gagal dimuat", async () => {
    render(Avatar, { props: { name: "Citra", photo: "https://x.test/rusak.png" } });

    await fireEvent.error(screen.getByAltText("Citra"));

    expect(screen.queryByAltText("Citra")).not.toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("menambahkan class tambahan", () => {
    render(Avatar, { props: { name: "Budi", class: "h-20 w-20" } });

    expect(screen.getByText("B")).toHaveClass("h-20", "w-20");
  });
});
