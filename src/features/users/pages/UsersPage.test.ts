import { fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { fail, makeUser, ok, renderWithProviders, typeInto } from "../../../test-utils";
import { getUsers } from "../api/userApi";
import UsersPage from "./UsersPage.svelte";

vi.mock("../api/userApi");

const people = [
  makeUser({ id: 1, name: "Budi", email: "budi@del.ac.id" }),
  makeUser({ id: 2, name: "Ani", email: "ani@kampus.id", photo: "https://x.test/ani.png" }),
];

describe("UsersPage", () => {
  it("menampilkan status memuat", async () => {
    vi.mocked(getUsers).mockReturnValue(new Promise(() => {}));
    renderWithProviders(UsersPage);
    expect(await screen.findByText("Memuat pengguna...")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila gagal dimuat", async () => {
    vi.mocked(getUsers).mockResolvedValue(fail());
    renderWithProviders(UsersPage);
    expect(await screen.findByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan dan menyaring pengguna berdasarkan nama atau email", async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: people }));
    renderWithProviders(UsersPage);
    expect(await screen.findByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Ani")).toBeInTheDocument();

    const search = screen.getByLabelText("Cari pengguna");
    await typeInto(search, "budi");
    expect(screen.queryByText("Ani")).not.toBeInTheDocument();

    await typeInto(search, "@kampus");
    expect(screen.queryByText("Budi")).not.toBeInTheDocument();
    expect(screen.getByText("Ani")).toBeInTheDocument();

    await typeInto(search, "zzz");
    expect(screen.getByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });
});
