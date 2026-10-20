import { get } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fail, makeContent, makeCourse, makeDetail, ok, resetStores } from "../../../test-utils";
import * as api from "../api/courseApi";
import * as store from "./coursesStore";

vi.mock("../api/courseApi");

beforeEach(resetStores);

describe("pemuatan", () => {
  it("loadCourses: sukses mengisi, gagal mengosongkan", async () => {
    vi.mocked(api.getCourses).mockResolvedValue(ok({ courses: [makeCourse()] }));
    await store.loadCourses(true);
    expect(api.getCourses).toHaveBeenCalledWith(true);
    expect(get(store.courses)).toHaveLength(1);
    expect(get(store.isCoursesLoading)).toBe(false);

    vi.mocked(api.getCourses).mockResolvedValue(fail());
    await store.loadCourses(false);
    expect(get(store.courses)).toEqual([]);
  });

  it("loadCourse: sukses mengisi, gagal menjadi null", async () => {
    vi.mocked(api.getCourse).mockResolvedValue(ok({ course: makeDetail() }));
    await store.loadCourse(10);
    expect(get(store.course)?.id).toBe(10);
    expect(get(store.isCourseLoading)).toBe(false);

    vi.mocked(api.getCourse).mockResolvedValue(fail());
    await store.loadCourse(10);
    expect(get(store.course)).toBeNull();
  });

  it("loadContent: sukses mengisi, gagal menjadi null", async () => {
    vi.mocked(api.getContent).mockResolvedValue(ok({ course_content: makeContent() }));
    await store.loadContent(100);
    expect(get(store.content)?.id).toBe(100);
    expect(get(store.isContentLoading)).toBe(false);

    vi.mocked(api.getContent).mockResolvedValue(fail());
    await store.loadContent(100);
    expect(get(store.content)).toBeNull();
  });
});

describe("mutasi", () => {
  const file = new File(["x"], "c.png");

  // [nama, pemanggil, fungsi API, argumen API, bendera]
  const cases: [string, () => Promise<unknown>, keyof typeof api, unknown[], keyof typeof store][] = [
    ["addCourse", () => store.addCourse("T", "D"), "postCourse", ["T", "D"], "isAdding"],
    ["changeCourse", () => store.changeCourse(1, "T", "D"), "putCourse", [1, "T", "D"], "isChanging"],
    ["changeCover", () => store.changeCover(1, file), "postCover", [1, file], "isChangingCover"],
    ["removeCourse", () => store.removeCourse(1), "deleteCourse", [1], "isDeleting"],
    ["removeAllCourses", () => store.removeAllCourses(), "deleteAllCourses", [], "isDeletingAll"],
    ["joinCourse", () => store.joinCourse(1), "postStudent", [1], "isStudentMutating"],
    ["leaveCourse", () => store.leaveCourse(1), "deleteStudent", [1], "isStudentMutating"],
    ["rateCourse", () => store.rateCourse(1, 5, "c"), "putRating", [1, 5, "c"], "isRating"],
    ["addContent", () => store.addContent(1, "T", "yt"), "postContent", [1, "T", "yt"], "isContentMutating"],
    ["changeContent", () => store.changeContent(2, "T", "yt"), "putContent", [2, "T", "yt"], "isContentMutating"],
    ["removeContent", () => store.removeContent(2), "deleteContent", [2], "isContentMutating"],
    ["setLearnStatus", () => store.setLearnStatus(2, 1), "postLearn", [2, 1], "isContentMutating"],
  ];

  it.each(cases)("%s memanggil API dan menurunkan bendera", async (_name, call, apiName, args, flag) => {
    let during = false;
    vi.mocked(api[apiName] as any).mockImplementation(async () => {
      during = get(store[flag] as any);
      return ok();
    });
    const response = (await call()) as ApiResponse;
    expect(response.status).toBe("success");
    expect(api[apiName]).toHaveBeenCalledWith(...args);
    expect(during).toBe(true);
    expect(get(store[flag] as any)).toBe(false);
  });
});
