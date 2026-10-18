import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { courseApi } from "../api/courseApi";
import {
  addContent,
  addCourse,
  changeContentStatus,
  changeCover,
  changeRating,
  courseContent,
  courseDetail,
  courses,
  deleteAllCourses,
  deleteContent,
  deleteCourse,
  fetchCourseContent,
  fetchCourseDetail,
  fetchCourses,
  getCoursesSnapshot,
  isContentChanged,
  isContentLoading,
  isCourseChanged,
  isCoursesLoading,
  isCoverChanged,
  isDetailLoading,
  isRatingChanged,
  isStudentChanged,
  joinCourse,
  leaveCourse,
  resetCoursesState,
  resetMutationFlags,
  updateContent,
  updateCourse,
} from "./coursesStore";

vi.mock("../api/courseApi", () => ({
  courseApi: {
    getCourses: vi.fn(),
    getCourseById: vi.fn(),
    addCourse: vi.fn(),
    updateCourse: vi.fn(),
    changeCover: vi.fn(),
    deleteCourse: vi.fn(),
    deleteAllCourses: vi.fn(),
    joinCourse: vi.fn(),
    leaveCourse: vi.fn(),
    changeRating: vi.fn(),
    addContent: vi.fn(),
    updateContent: vi.fn(),
    getContentById: vi.fn(),
    deleteContent: vi.fn(),
    changeContentStatus: vi.fn(),
  },
}));

const makeCourse = (id: number, title = "Kursus") => ({ id, title }) as any;
const detail = { id: 5, title: "Detail" } as any;
const content = { id: 9, title: "Materi" } as any;
const payload = { title: "T", description: "D" };
const contentPayload = { title: "M", youtube: "https://youtu.be/abc" };

beforeEach(() => {
  resetCoursesState();
  for (const fn of Object.values(courseApi)) {
    vi.mocked(fn).mockReset();
    vi.mocked(fn).mockResolvedValue({} as any);
  }
  vi.mocked(courseApi.getCourses).mockResolvedValue([]);
  vi.mocked(courseApi.getCourseById).mockResolvedValue(detail);
  vi.mocked(courseApi.getContentById).mockResolvedValue(content);
});

describe("memuat data", () => {
  it("fetchCourses mengisi daftar dan mematikan status memuat", async () => {
    const list = [makeCourse(1)];
    vi.mocked(courseApi.getCourses).mockResolvedValue(list);

    const promise = fetchCourses();
    expect(get(isCoursesLoading)).toBe(true);
    await promise;

    expect(get(courses)).toBe(list);
    expect(get(isCoursesLoading)).toBe(false);
  });

  it("fetchCourses mengingat filter terakhir", async () => {
    await fetchCourses(true);
    await fetchCourses();

    expect(courseApi.getCourses).toHaveBeenNthCalledWith(1, true);
    expect(courseApi.getCourses).toHaveBeenNthCalledWith(2, true);
  });

  it("fetchCourses melempar ulang error dan mematikan status memuat", async () => {
    vi.mocked(courseApi.getCourses).mockRejectedValue(new Error("gagal"));

    await expect(fetchCourses()).rejects.toThrow("gagal");
    expect(get(isCoursesLoading)).toBe(false);
  });

  it("fetchCourseDetail menyalakan status memuat kecuali mode silent", async () => {
    const states: boolean[] = [];
    const unsubscribe = isDetailLoading.subscribe((v) => states.push(v));

    await fetchCourseDetail(5);
    expect(states).toContain(true);
    expect(get(courseDetail)).toBe(detail);

    states.length = 0;
    await fetchCourseDetail(5, true);
    expect(states).not.toContain(true);

    unsubscribe();
  });

  it("fetchCourseDetail melempar ulang error dan mematikan status memuat", async () => {
    vi.mocked(courseApi.getCourseById).mockRejectedValue(new Error("gagal"));

    await expect(fetchCourseDetail(5)).rejects.toThrow("gagal");
    expect(get(isDetailLoading)).toBe(false);
  });

  it("fetchCourseContent mengisi materi", async () => {
    await fetchCourseContent(9);

    expect(courseApi.getContentById).toHaveBeenCalledWith(9);
    expect(get(courseContent)).toBe(content);
    expect(get(isContentLoading)).toBe(false);
  });

  it("fetchCourseContent melempar ulang error dan mematikan status memuat", async () => {
    vi.mocked(courseApi.getContentById).mockRejectedValue(new Error("gagal"));

    await expect(fetchCourseContent(9)).rejects.toThrow("gagal");
    expect(get(isContentLoading)).toBe(false);
  });
});

describe("kursus", () => {
  it("addCourse tanpa sampul hanya membuat kursus dan memuat ulang daftar", async () => {
    await addCourse(payload);

    expect(courseApi.addCourse).toHaveBeenCalledWith(payload);
    expect(courseApi.changeCover).not.toHaveBeenCalled();
    expect(courseApi.getCourses).toHaveBeenCalledTimes(1);
    expect(get(isCourseChanged)).toBe(true);
    expect(get(isCoverChanged)).toBe(false);
  });

  it("addCourse dengan sampul mengunggah ke kursus terbaru berjudul sama", async () => {
    const file = new File(["x"], "cover.png");
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce([
      makeCourse(1, "T"),
      makeCourse(3, "T"),
      makeCourse(2, "Lain"),
    ]);

    await addCourse(payload, file);

    expect(courseApi.getCourses).toHaveBeenNthCalledWith(1, true);
    expect(courseApi.changeCover).toHaveBeenCalledWith(3, file);
    expect(get(isCoverChanged)).toBe(true);
    expect(get(isCourseChanged)).toBe(true);
  });

  it("addCourse dengan sampul tidak mengunggah bila kursusnya tidak ditemukan", async () => {
    const file = new File(["x"], "cover.png");
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce([]);

    await addCourse(payload, file);

    expect(courseApi.changeCover).not.toHaveBeenCalled();
    expect(get(isCoverChanged)).toBe(false);
    expect(get(isCourseChanged)).toBe(true);
  });

  it("updateCourse menaikkan bendera dan memuat ulang detail", async () => {
    await updateCourse(5, payload);

    expect(courseApi.updateCourse).toHaveBeenCalledWith(5, payload);
    expect(get(isCourseChanged)).toBe(true);
    expect(get(courseDetail)).toBe(detail);
  });

  it("changeCover menaikkan bendera sampul", async () => {
    const file = new File(["x"], "cover.png");
    await changeCover(5, file);

    expect(courseApi.changeCover).toHaveBeenCalledWith(5, file);
    expect(get(isCoverChanged)).toBe(true);
    expect(courseApi.getCourseById).toHaveBeenCalledWith(5);
  });

  it("deleteCourse dan deleteAllCourses memuat ulang daftar", async () => {
    await deleteCourse(5);
    expect(courseApi.deleteCourse).toHaveBeenCalledWith(5);
    expect(get(isCourseChanged)).toBe(true);

    isCourseChanged.set(false);
    await deleteAllCourses();
    expect(courseApi.deleteAllCourses).toHaveBeenCalled();
    expect(get(isCourseChanged)).toBe(true);
    expect(courseApi.getCourses).toHaveBeenCalledTimes(2);
  });
});

describe("peserta dan rating", () => {
  it("joinCourse dan leaveCourse menaikkan bendera peserta", async () => {
    await joinCourse(5);
    expect(courseApi.joinCourse).toHaveBeenCalledWith(5);
    expect(get(isStudentChanged)).toBe(true);

    isStudentChanged.set(false);
    await leaveCourse(5);
    expect(courseApi.leaveCourse).toHaveBeenCalledWith(5);
    expect(get(isStudentChanged)).toBe(true);
  });

  it("changeRating menaikkan bendera rating", async () => {
    const rating = { ratings: 5 as const, comment: "Mantap" };
    await changeRating(5, rating);

    expect(courseApi.changeRating).toHaveBeenCalledWith(5, rating);
    expect(get(isRatingChanged)).toBe(true);
  });
});

describe("konten", () => {
  it("addContent, updateContent, dan deleteContent menaikkan bendera konten", async () => {
    await addContent(5, contentPayload);
    expect(courseApi.addContent).toHaveBeenCalledWith(5, contentPayload);
    expect(get(isContentChanged)).toBe(true);

    isContentChanged.set(false);
    await updateContent(5, 9, contentPayload);
    expect(courseApi.updateContent).toHaveBeenCalledWith(9, contentPayload);
    expect(get(isContentChanged)).toBe(true);

    isContentChanged.set(false);
    await deleteContent(5, 9);
    expect(courseApi.deleteContent).toHaveBeenCalledWith(9);
    expect(get(isContentChanged)).toBe(true);
    expect(courseApi.getCourseById).toHaveBeenCalledTimes(3);
  });

  it("changeContentStatus memuat ulang materi", async () => {
    await changeContentStatus(9, 1);

    expect(courseApi.changeContentStatus).toHaveBeenCalledWith(9, 1);
    expect(get(isContentChanged)).toBe(true);
    expect(get(courseContent)).toBe(content);
  });
});

describe("utilitas", () => {
  it("resetMutationFlags mematikan semua bendera", () => {
    [
      isCourseChanged,
      isCoverChanged,
      isStudentChanged,
      isRatingChanged,
      isContentChanged,
    ].forEach((flag) => flag.set(true));

    resetMutationFlags();

    expect(get(isCourseChanged)).toBe(false);
    expect(get(isCoverChanged)).toBe(false);
    expect(get(isStudentChanged)).toBe(false);
    expect(get(isRatingChanged)).toBe(false);
    expect(get(isContentChanged)).toBe(false);
  });

  it("resetCoursesState mengosongkan data dan filter", async () => {
    await fetchCourses(true);
    courseDetail.set(detail);
    courseContent.set(content);
    isCourseChanged.set(true);

    resetCoursesState();

    expect(get(courses)).toEqual([]);
    expect(get(courseDetail)).toBeNull();
    expect(get(courseContent)).toBeNull();
    expect(get(isCourseChanged)).toBe(false);

    await fetchCourses();
    expect(courseApi.getCourses).toHaveBeenLastCalledWith(false);
  });

  it("getCoursesSnapshot membaca nilai saat ini", () => {
    const list = [makeCourse(1)];
    courses.set(list);
    expect(getCoursesSnapshot()).toBe(list);
  });
});
