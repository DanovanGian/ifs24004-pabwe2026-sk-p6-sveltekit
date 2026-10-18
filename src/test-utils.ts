import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { page } from "$app/state";
import {
  authProfile,
  authToken,
  isAuthenticated,
  isProfile,
} from "./features/auth/states/authStore";
import type { User } from "./features/users/api/userApi";
import type {
  Course,
  CourseContent,
  CourseDetail,
} from "./features/courses/api/courseApi";

export const mockUser: User = {
  id: 1,
  name: "Delcom Testing",
  email: "testing@delcom.org",
  email_verified_at: null,
  photo: "img/profile/1_1709107233.png",
  created_at: "2024-02-28T04:11:30.000000Z",
  updated_at: "2024-02-28T04:11:30.000000Z",
};

export function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    user_id: 2,
    title: "Belajar ReactJS",
    cover: "http://localhost/cover.jpg",
    description: "Belajar ReactJS dari awal",
    created_at: "2024-10-06T01:27:37.000000Z",
    updated_at: "2024-10-06T01:28:31.000000Z",
    author: { name: "Abdullah Ubaid", photo: "http://localhost/user.png" },
    students: [3, 4],
    total_contents: 3,
    avg_ratings: "4.0000",
    ...overrides,
  };
}

export function makeContent(
  overrides: Partial<CourseContent> = {}
): CourseContent {
  return {
    id: 9,
    course_id: 1,
    title: "Dasar Java",
    youtube: "https://youtu.be/uHyfQV0kbgo",
    created_at: "2024-10-06T00:55:15.000000Z",
    updated_at: "2024-10-06T00:55:15.000000Z",
    my_status_finished: false,
    ...overrides,
  };
}

export function makeCourseDetail(
  overrides: Partial<CourseDetail> = {}
): CourseDetail {
  return {
    ...makeCourse(),
    contents: [makeContent()],
    ratings: [{ name: "Budi", ratings: 4, comment: "Keren" }],
    avg_ratings: "4.00",
    my_percentage_finished: "33.33",
    ...overrides,
  } as CourseDetail;
}

interface RenderOptions {
  props?: Record<string, any>;
  pathname?: string;
  params?: Record<string, string>;
  user?: User | null; // null = belum login
}

// "Provider" di aplikasi ini adalah state global: store auth dan objek page.
export function renderWithProviders(
  Component: any,
  { props = {}, pathname = "/", params = {}, user = mockUser }: RenderOptions = {}
) {
  (page as any).url = new URL(pathname, "http://localhost");
  (page as any).params = params;

  if (user) {
    authToken.set("test-token");
    authProfile.set(user);
    isAuthenticated.set(true);
    isProfile.set(false);
  } else {
    authToken.set(null);
    authProfile.set(null);
    isAuthenticated.set(false);
    isProfile.set(false);
  }

  return render(Component, { props });
}

// Klik listener Svelte 5 lewat element.click(), lalu tunggu DOM diperbarui.
export async function click(element: HTMLElement) {
  element.click();
  await tick();
}
