declare global {
  namespace App {}

  interface ApiResponse<T = any> {
    status: string;
    message: string;
    data?: T;
  }

  interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
  }

  interface Course {
    id: number;
    user_id: number;
    title: string;
    cover: string | null;
    description: string;
    created_at: string;
    updated_at: string;
    author: { name: string; photo: string | null };
    students: number[];
    total_contents: number;
    avg_ratings: string | null;
  }

  interface CourseContent {
    id: number;
    course_id: number;
    title: string;
    youtube: string;
    created_at: string;
    updated_at: string;
    my_status_finished: boolean;
  }

  interface CourseRating {
    name: string;
    ratings: number;
    comment: string;
  }

  interface CourseDetail extends Course {
    contents: CourseContent[];
    ratings: CourseRating[];
    my_percentage_finished: string;
  }
}

export {};
