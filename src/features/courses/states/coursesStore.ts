import { writable, get } from "svelte/store";
import {
  courseApi,
  type Course,
  type CourseDetail,
  type CourseContent,
  type CoursePayload,
  type ContentPayload,
  type RatingPayload,
} from "../api/courseApi";

// ---- Data ----
export const courses = writable<Course[]>([]);
export const courseDetail = writable<CourseDetail | null>(null);
export const courseContent = writable<CourseContent | null>(null);

// ---- Status pemuatan ----
export const isCoursesLoading = writable<boolean>(false);
export const isDetailLoading = writable<boolean>(false);
export const isContentLoading = writable<boolean>(false);

// ---- Bendera mutasi: true setelah operasi tulis berhasil ----
export const isCourseChanged = writable<boolean>(false);
export const isCoverChanged = writable<boolean>(false);
export const isStudentChanged = writable<boolean>(false);
export const isRatingChanged = writable<boolean>(false);
export const isContentChanged = writable<boolean>(false);

export function resetMutationFlags(): void {
  isCourseChanged.set(false);
  isCoverChanged.set(false);
  isStudentChanged.set(false);
  isRatingChanged.set(false);
  isContentChanged.set(false);
}

// Mengingat filter terakhir supaya muat ulang setelah mutasi memakai filter yang sama.
let lastOnlyMine = false;

// ---- Memuat data ----
export async function fetchCourses(onlyMine = lastOnlyMine): Promise<void> {
  lastOnlyMine = onlyMine;
  isCoursesLoading.set(true);
  try {
    courses.set(await courseApi.getCourses(onlyMine));
  } finally {
    isCoursesLoading.set(false);
  }
}

export async function fetchCourseDetail(
  id: number | string,
  silent = false
): Promise<void> {
  if (!silent) isDetailLoading.set(true);
  try {
    courseDetail.set(await courseApi.getCourseById(id));
  } finally {
    isDetailLoading.set(false);
  }
}

export async function fetchCourseContent(
  contentId: number | string
): Promise<void> {
  isContentLoading.set(true);
  try {
    courseContent.set(await courseApi.getContentById(contentId));
  } finally {
    isContentLoading.set(false);
  }
}

// ---- Kursus ----
export async function addCourse(
  payload: CoursePayload,
  cover: File | null = null
): Promise<void> {
  await courseApi.addCourse(payload);

  if (cover) {
    // Server tidak mengembalikan id kursus baru: cari kursus milik saya
    // dengan judul yang sama dan id terbesar (yang paling baru).
    const mine = await courseApi.getCourses(true);
    const created = mine
      .filter((course) => course.title === payload.title)
      .sort((a, b) => b.id - a.id)[0];

    if (created) {
      await courseApi.changeCover(created.id, cover);
      isCoverChanged.set(true);
    }
  }

  isCourseChanged.set(true);
  await fetchCourses();
}

export async function updateCourse(
  id: number | string,
  payload: CoursePayload
): Promise<void> {
  await courseApi.updateCourse(id, payload);
  isCourseChanged.set(true);
  await fetchCourseDetail(id, true);
}

export async function changeCover(
  id: number | string,
  cover: File
): Promise<void> {
  await courseApi.changeCover(id, cover);
  isCoverChanged.set(true);
  await fetchCourseDetail(id, true);
}

export async function deleteCourse(id: number | string): Promise<void> {
  await courseApi.deleteCourse(id);
  isCourseChanged.set(true);
  await fetchCourses();
}

export async function deleteAllCourses(): Promise<void> {
  await courseApi.deleteAllCourses();
  isCourseChanged.set(true);
  await fetchCourses();
}

// ---- Peserta dan rating ----
export async function joinCourse(id: number | string): Promise<void> {
  await courseApi.joinCourse(id);
  isStudentChanged.set(true);
  await fetchCourseDetail(id, true);
}

export async function leaveCourse(id: number | string): Promise<void> {
  await courseApi.leaveCourse(id);
  isStudentChanged.set(true);
  await fetchCourseDetail(id, true);
}

export async function changeRating(
  id: number | string,
  payload: RatingPayload
): Promise<void> {
  await courseApi.changeRating(id, payload);
  isRatingChanged.set(true);
  await fetchCourseDetail(id, true);
}

// ---- Konten ----
export async function addContent(
  courseId: number | string,
  payload: ContentPayload
): Promise<void> {
  await courseApi.addContent(courseId, payload);
  isContentChanged.set(true);
  await fetchCourseDetail(courseId, true);
}

export async function updateContent(
  courseId: number | string,
  contentId: number | string,
  payload: ContentPayload
): Promise<void> {
  await courseApi.updateContent(contentId, payload);
  isContentChanged.set(true);
  await fetchCourseDetail(courseId, true);
}

export async function deleteContent(
  courseId: number | string,
  contentId: number | string
): Promise<void> {
  await courseApi.deleteContent(contentId);
  isContentChanged.set(true);
  await fetchCourseDetail(courseId, true);
}

export async function changeContentStatus(
  contentId: number | string,
  status: 0 | 1
): Promise<void> {
  await courseApi.changeContentStatus(contentId, status);
  isContentChanged.set(true);
  await fetchCourseContent(contentId);
}

// Dipakai tes dan saat logout agar tidak ada data pengguna lama yang tersisa.
export function resetCoursesState(): void {
  courses.set([]);
  courseDetail.set(null);
  courseContent.set(null);
  resetMutationFlags();
  lastOnlyMine = false;
}

// Mengekspos nilai saat ini tanpa langganan (berguna di fungsi non-komponen).
export function getCoursesSnapshot(): Course[] {
  return get(courses);
}
