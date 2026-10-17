import { apiHelper } from "../../../helpers/apiHelper";

export interface CourseAuthor {
  name: string;
  photo: string;
}

export interface Course {
  id: number;
  user_id: number;
  title: string;
  cover: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  author: CourseAuthor;
  students: number[]; // daftar id pengguna yang menjadi peserta
  total_contents: number;
  avg_ratings: string | null;
}

export interface CourseContent {
  id: number;
  course_id: number;
  title: string;
  youtube: string;
  created_at: string;
  updated_at: string;
  my_status_finished: boolean;
}

export interface CourseRating {
  name: string;
  ratings: number;
  comment: string;
}

export interface CourseDetail extends Omit<Course, "avg_ratings"> {
  contents: CourseContent[];
  ratings: CourseRating[];
  avg_ratings: string | null;
  my_percentage_finished: string;
}

export interface CoursePayload {
  title: string;
  description: string;
}

export interface ContentPayload {
  title: string;
  youtube: string;
}

export interface RatingPayload {
  ratings: 1 | 2 | 3 | 4 | 5;
  comment: string;
}

export const courseApi = {
  // ---- Kursus ----
  async getCourses(onlyMine = false): Promise<Course[]> {
    const query = onlyMine ? "?is_me=1" : "";
    const response = await apiHelper<{ courses: Course[] }>(`/courses${query}`);
    return response.data!.courses;
  },

  async getCourseById(id: number | string): Promise<CourseDetail> {
    const response = await apiHelper<{ course: CourseDetail }>(`/courses/${id}`);
    return response.data!.course;
  },

  // Server tidak mengembalikan id kursus baru, jadi sampul diunggah terpisah
  // lewat changeCover setelah daftar dimuat ulang.
  addCourse(payload: CoursePayload) {
    return apiHelper("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCourse(id: number | string, payload: CoursePayload) {
    return apiHelper(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  changeCover(id: number | string, cover: File) {
    const formData = new FormData();
    formData.append("cover", cover);
    return apiHelper(`/courses/${id}/cover`, {
      method: "POST",
      body: formData,
    });
  },

  deleteCourse(id: number | string) {
    return apiHelper(`/courses/${id}`, { method: "DELETE" });
  },

  deleteAllCourses() {
    return apiHelper("/courses", { method: "DELETE" });
  },

  // ---- Peserta ----
  joinCourse(id: number | string) {
    return apiHelper(`/courses/${id}/students`, { method: "POST" });
  },

  leaveCourse(id: number | string) {
    return apiHelper(`/courses/${id}/students`, { method: "DELETE" });
  },

  changeRating(id: number | string, payload: RatingPayload) {
    return apiHelper(`/courses/${id}/students/ratings`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // ---- Konten ----
  addContent(courseId: number | string, payload: ContentPayload) {
    return apiHelper<{ content_id: number }>(`/courses/${courseId}/contents`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateContent(contentId: number | string, payload: ContentPayload) {
    return apiHelper(`/courses/-/contents/${contentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getContentById(contentId: number | string): Promise<CourseContent> {
    const response = await apiHelper<{ course_content: CourseContent }>(
      `/courses/-/contents/${contentId}`
    );
    return response.data!.course_content;
  },

  deleteContent(contentId: number | string) {
    return apiHelper(`/courses/-/contents/${contentId}`, { method: "DELETE" });
  },

  changeContentStatus(contentId: number | string, status: 0 | 1) {
    return apiHelper(`/courses/-/contents/${contentId}/learns`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },
};
