import { apiRequest } from "../../../helpers/apiHelper";

type Id = number | string;

export function getCourses(onlyMine: boolean) {
  return apiRequest<{ courses: Course[] }>(
    "GET",
    onlyMine ? "/courses?is_me=1" : "/courses",
  );
}

export function getCourse(id: Id) {
  return apiRequest<{ course: CourseDetail }>("GET", `/courses/${id}`);
}

export function postCourse(title: string, description: string) {
  return apiRequest("POST", "/courses", { title, description });
}

export function postCover(id: Id, file: File) {
  const form = new FormData();
  form.append("cover", file);
  return apiRequest("POST", `/courses/${id}/cover`, form);
}

export function putCourse(id: Id, title: string, description: string) {
  return apiRequest("PUT", `/courses/${id}`, { title, description });
}

export function deleteCourse(id: Id) {
  return apiRequest("DELETE", `/courses/${id}`);
}

export function deleteAllCourses() {
  return apiRequest("DELETE", "/courses");
}

export function postStudent(id: Id) {
  return apiRequest("POST", `/courses/${id}/students`);
}

export function deleteStudent(id: Id) {
  return apiRequest("DELETE", `/courses/${id}/students`);
}

export function putRating(id: Id, ratings: number, comment: string) {
  return apiRequest("PUT", `/courses/${id}/students/ratings`, {
    ratings,
    comment,
  });
}

export function postContent(courseId: Id, title: string, youtube: string) {
  return apiRequest("POST", `/courses/${courseId}/contents`, {
    title,
    youtube,
  });
}

export function getContent(id: Id) {
  return apiRequest<{ course_content: CourseContent }>(
    "GET",
    `/courses/-/contents/${id}`,
  );
}

export function putContent(id: Id, title: string, youtube: string) {
  return apiRequest("PUT", `/courses/-/contents/${id}`, { title, youtube });
}

export function deleteContent(id: Id) {
  return apiRequest("DELETE", `/courses/-/contents/${id}`);
}

export function postLearn(id: Id, status: 0 | 1) {
  return apiRequest("POST", `/courses/-/contents/${id}/learns`, { status });
}
