import { describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../helpers/apiHelper";
import * as api from "./courseApi";

vi.mock("../../../helpers/apiHelper");

describe("courseApi", () => {
  it.each([
    ["getCourses semua", () => api.getCourses(false), ["GET", "/courses"]],
    ["getCourses milik saya", () => api.getCourses(true), ["GET", "/courses?is_me=1"]],
    ["getCourse", () => api.getCourse(5), ["GET", "/courses/5"]],
    ["postCourse", () => api.postCourse("T", "D"), ["POST", "/courses", { title: "T", description: "D" }]],
    ["putCourse", () => api.putCourse(5, "T", "D"), ["PUT", "/courses/5", { title: "T", description: "D" }]],
    ["deleteCourse", () => api.deleteCourse(5), ["DELETE", "/courses/5"]],
    ["deleteAllCourses", () => api.deleteAllCourses(), ["DELETE", "/courses"]],
    ["postStudent", () => api.postStudent(5), ["POST", "/courses/5/students"]],
    ["deleteStudent", () => api.deleteStudent(5), ["DELETE", "/courses/5/students"]],
    ["putRating", () => api.putRating(5, 4, "ok"), ["PUT", "/courses/5/students/ratings", { ratings: 4, comment: "ok" }]],
    ["postContent", () => api.postContent(5, "T", "yt"), ["POST", "/courses/5/contents", { title: "T", youtube: "yt" }]],
    ["getContent", () => api.getContent(9), ["GET", "/courses/-/contents/9"]],
    ["putContent", () => api.putContent(9, "T", "yt"), ["PUT", "/courses/-/contents/9", { title: "T", youtube: "yt" }]],
    ["deleteContent", () => api.deleteContent(9), ["DELETE", "/courses/-/contents/9"]],
    ["postLearn", () => api.postLearn(9, 1), ["POST", "/courses/-/contents/9/learns", { status: 1 }]],
  ])("%s", async (_name, call, expected) => {
    await call();
    expect(apiRequest).toHaveBeenCalledWith(...(expected as [string, string, object?]));
  });

  it("postCover mengunggah berkas pada field cover", async () => {
    await api.postCover(5, new File(["x"], "c.png"));
    const [method, path, form] = vi.mocked(apiRequest).mock.calls[0];
    expect(method).toBe("POST");
    expect(path).toBe("/courses/5/cover");
    expect((form as FormData).get("cover")).toBeInstanceOf(File);
  });
});
