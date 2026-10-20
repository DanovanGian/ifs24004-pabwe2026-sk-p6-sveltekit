import { page } from "$app/state";
import { fireEvent, render } from "@testing-library/svelte";
import type { Component } from "svelte";
import { authProfile, authToken, isAuthLoading } from "./features/auth/states/authStore";
import {
  content,
  course,
  courses,
  isAdding,
  isChanging,
  isChangingCover,
  isContentLoading,
  isContentMutating,
  isCourseLoading,
  isCoursesLoading,
  isDeleting,
  isDeletingAll,
  isRating,
  isStudentMutating,
} from "./features/courses/states/coursesStore";
import {
  isPasswordSaving,
  isPhotoSaving,
  isProfileSaving,
  isUsersLoading,
  users,
} from "./features/users/states/usersStore";

export const ok = (data?: unknown, message = "Berhasil") =>
  ({ status: "success", message, data }) as ApiResponse;

export const fail = (message = "Gagal", data?: unknown) =>
  ({ status: "fail", message, data }) as ApiResponse;

export const makeUser = (override: Partial<User> = {}): User => ({
  id: 1,
  name: "Budi",
  email: "budi@del.ac.id",
  email_verified_at: null,
  photo: null,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  ...override,
});

export const makeCourse = (override: Partial<Course> = {}): Course => ({
  id: 10,
  user_id: 1,
  title: "Belajar Svelte",
  cover: null,
  description: "Dasar-dasar Svelte",
  created_at: "2026-10-01T12:00:00Z",
  updated_at: "2026-10-01T12:00:00Z",
  author: { name: "Budi", photo: null },
  students: [],
  total_contents: 2,
  avg_ratings: "4.5000",
  ...override,
});

export const makeContent = (override: Partial<CourseContent> = {}): CourseContent => ({
  id: 100,
  course_id: 10,
  title: "Pengantar",
  youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  created_at: "2026-10-01T12:00:00Z",
  updated_at: "2026-10-01T12:00:00Z",
  my_status_finished: false,
  ...override,
});

export const makeDetail = (override: Partial<CourseDetail> = {}): CourseDetail => ({
  ...makeCourse(),
  contents: [makeContent(), makeContent({ id: 101, title: "Komponen", my_status_finished: true })],
  ratings: [{ name: "Ani", ratings: 5, comment: "Bagus" }],
  my_percentage_finished: "50.00",
  ...override,
});

export function resetStores() {
  authToken.set(null);
  authProfile.set(null);
  courses.set([]);
  course.set(null);
  content.set(null);
  users.set([]);
  for (const flag of [
    isAuthLoading,
    isUsersLoading,
    isProfileSaving,
    isPhotoSaving,
    isPasswordSaving,
    isCoursesLoading,
    isCourseLoading,
    isContentLoading,
    isAdding,
    isChanging,
    isChangingCover,
    isDeleting,
    isDeletingAll,
    isStudentMutating,
    isRating,
    isContentMutating,
  ]) {
    flag.set(false);
  }
}

interface ProviderOptions {
  props?: Record<string, unknown>;
  token?: string | null;
  profile?: User | null;
  path?: string;
  params?: Record<string, string>;
}

/** Merender komponen setelah mengatur ulang store, sesi, dan rute palsu. */
export function renderWithProviders(
  component: Component<any>,
  options: ProviderOptions = {},
) {
  resetStores();
  authToken.set(options.token ?? null);
  authProfile.set(options.profile ?? null);
  (page as any).url = new URL(`http://localhost${options.path ?? "/"}`);
  (page as any).params = options.params ?? {};
  return render(component, { props: options.props ?? {} });
}

/** Mengirim formulir ke-`index` di dalam container. */
export async function submitForm(container: HTMLElement, index = 0) {
  await fireEvent.submit(container.querySelectorAll("form")[index]);
}

/** Mengetik ke input/textarea (Svelte bind:value mendengar event `input`). */
export async function typeInto(element: HTMLElement, value: string) {
  await fireEvent.input(element, { target: { value } });
}
