import { writable } from "svelte/store";
import { isSuccess } from "../../../helpers/apiHelper";
import { withFlag } from "../../../helpers/storeHelper";
import {
  deleteAllCourses,
  deleteContent,
  deleteCourse,
  deleteStudent,
  getContent,
  getCourse,
  getCourses,
  postContent,
  postCourse,
  postCover,
  postLearn,
  postStudent,
  putContent,
  putCourse,
  putRating,
} from "../api/courseApi";

type Id = number | string;

// koleksi, detail, dan konten
export const courses = writable<Course[]>([]);
export const course = writable<CourseDetail | null>(null);
export const content = writable<CourseContent | null>(null);

// bendera pemuatan
export const isCoursesLoading = writable(false);
export const isCourseLoading = writable(false);
export const isContentLoading = writable(false);

// bendera mutasi
export const isAdding = writable(false);
export const isChanging = writable(false);
export const isChangingCover = writable(false);
export const isDeleting = writable(false);
export const isDeletingAll = writable(false);
export const isStudentMutating = writable(false);
export const isRating = writable(false);
export const isContentMutating = writable(false);

export function loadCourses(onlyMine: boolean) {
  return withFlag(isCoursesLoading, async () => {
    const response = await getCourses(onlyMine);
    courses.set(isSuccess(response) ? response.data.courses : []);
    return response;
  });
}

export function loadCourse(id: Id) {
  return withFlag(isCourseLoading, async () => {
    const response = await getCourse(id);
    course.set(isSuccess(response) ? response.data.course : null);
    return response;
  });
}

export function loadContent(id: Id) {
  return withFlag(isContentLoading, async () => {
    const response = await getContent(id);
    content.set(isSuccess(response) ? response.data.course_content : null);
    return response;
  });
}

export function addCourse(title: string, description: string) {
  return withFlag(isAdding, () => postCourse(title, description));
}

export function changeCourse(id: Id, title: string, description: string) {
  return withFlag(isChanging, () => putCourse(id, title, description));
}

export function changeCover(id: Id, file: File) {
  return withFlag(isChangingCover, () => postCover(id, file));
}

export function removeCourse(id: Id) {
  return withFlag(isDeleting, () => deleteCourse(id));
}

export function removeAllCourses() {
  return withFlag(isDeletingAll, () => deleteAllCourses());
}

export function joinCourse(id: Id) {
  return withFlag(isStudentMutating, () => postStudent(id));
}

export function leaveCourse(id: Id) {
  return withFlag(isStudentMutating, () => deleteStudent(id));
}

export function rateCourse(id: Id, ratings: number, comment: string) {
  return withFlag(isRating, () => putRating(id, ratings, comment));
}

export function addContent(courseId: Id, title: string, youtube: string) {
  return withFlag(isContentMutating, () => postContent(courseId, title, youtube));
}

export function changeContent(id: Id, title: string, youtube: string) {
  return withFlag(isContentMutating, () => putContent(id, title, youtube));
}

export function removeContent(id: Id) {
  return withFlag(isContentMutating, () => deleteContent(id));
}

export function setLearnStatus(id: Id, status: 0 | 1) {
  return withFlag(isContentMutating, () => postLearn(id, status));
}
