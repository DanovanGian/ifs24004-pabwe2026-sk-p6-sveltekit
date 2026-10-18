import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiHelper } from "../../../helpers/apiHelper";
import { courseApi } from "./courseApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiHelper: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(apiHelper).mockResolvedValue({ status: "success" } as any);
});

describe("courseApi - kursus", () => {
  it("getCourses tanpa filter memanggil /courses", async () => {
    const courses = [{ id: 1 }];
    vi.mocked(apiHelper).mockResolvedValue({ data: { courses } } as any);

    expect(await courseApi.getCourses()).toBe(courses);
    expect(apiHelper).toHaveBeenCalledWith("/courses");
  });

  it("getCourses(true) menambahkan ?is_me=1", async () => {
    vi.mocked(apiHelper).mockResolvedValue({ data: { courses: [] } } as any);

    await courseApi.getCourses(true);
    expect(apiHelper).toHaveBeenCalledWith("/courses?is_me=1");
  });

  it("getCourseById mengembalikan data.course", async () => {
    const course = { id: 3 };
    vi.mocked(apiHelper).mockResolvedValue({ data: { course } } as any);

    expect(await courseApi.getCourseById(3)).toBe(course);
    expect(apiHelper).toHaveBeenCalledWith("/courses/3");
  });

  it("addCourse mengirim POST", async () => {
    const payload = { title: "T", description: "D" };
    await courseApi.addCourse(payload);
    expect(apiHelper).toHaveBeenCalledWith("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("updateCourse mengirim PUT", async () => {
    const payload = { title: "T2", description: "D2" };
    await courseApi.updateCourse(5, payload);
    expect(apiHelper).toHaveBeenCalledWith("/courses/5", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  });

  it("changeCover mengirim FormData berisi berkas 'cover'", async () => {
    const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });
    await courseApi.changeCover(5, file);

    const [path, init] = vi.mocked(apiHelper).mock.calls[0] as [string, any];
    expect(path).toBe("/courses/5/cover");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("cover")).toBe(file);
  });

  it("deleteCourse dan deleteAllCourses mengirim DELETE", async () => {
    await courseApi.deleteCourse(5);
    expect(apiHelper).toHaveBeenCalledWith("/courses/5", { method: "DELETE" });

    await courseApi.deleteAllCourses();
    expect(apiHelper).toHaveBeenCalledWith("/courses", { method: "DELETE" });
  });
});

describe("courseApi - peserta dan rating", () => {
  it("joinCourse dan leaveCourse memakai /students", async () => {
    await courseApi.joinCourse(5);
    expect(apiHelper).toHaveBeenCalledWith("/courses/5/students", {
      method: "POST",
    });

    await courseApi.leaveCourse(5);
    expect(apiHelper).toHaveBeenCalledWith("/courses/5/students", {
      method: "DELETE",
    });
  });

  it("changeRating mengirim PUT ke /students/ratings", async () => {
    const payload = { ratings: 4 as const, comment: "Bagus" };
    await courseApi.changeRating(5, payload);
    expect(apiHelper).toHaveBeenCalledWith("/courses/5/students/ratings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  });
});

describe("courseApi - konten", () => {
  const payload = { title: "Materi", youtube: "https://youtu.be/abc" };

  it("addContent mengirim POST ke /courses/:id/contents", async () => {
    await courseApi.addContent(5, payload);
    expect(apiHelper).toHaveBeenCalledWith("/courses/5/contents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("updateContent memakai jalur /courses/-/contents/:id", async () => {
    await courseApi.updateContent(9, payload);
    expect(apiHelper).toHaveBeenCalledWith("/courses/-/contents/9", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  });

  it("getContentById mengembalikan data.course_content", async () => {
    const content = { id: 9 };
    vi.mocked(apiHelper).mockResolvedValue({
      data: { course_content: content },
    } as any);

    expect(await courseApi.getContentById(9)).toBe(content);
    expect(apiHelper).toHaveBeenCalledWith("/courses/-/contents/9");
  });

  it("deleteContent mengirim DELETE", async () => {
    await courseApi.deleteContent(9);
    expect(apiHelper).toHaveBeenCalledWith("/courses/-/contents/9", {
      method: "DELETE",
    });
  });

  it("changeContentStatus mengirim status 0 atau 1", async () => {
    await courseApi.changeContentStatus(9, 1);
    expect(apiHelper).toHaveBeenCalledWith("/courses/-/contents/9/learns", {
      method: "POST",
      body: JSON.stringify({ status: 1 }),
    });
  });
});
