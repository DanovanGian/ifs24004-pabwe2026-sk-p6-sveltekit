<script lang="ts">
  import { BookOpen, Star, Users } from "lucide-svelte";
  import {
    formatRating,
    getCoverUrl,
    getPhotoUrl,
  } from "../../../helpers/toolsHelper";

  let { course }: { course: Course } = $props();
</script>

<a
  href={`/courses/${course.id}`}
  class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
>
  <img
    src={getCoverUrl(course.cover)}
    alt={`Sampul ${course.title}`}
    width="640"
    height="160"
    decoding="async"
    class="h-40 w-full bg-indigo-50 object-cover"
  />
  <div class="flex flex-1 flex-col gap-3 p-4">
    <h2 class="line-clamp-2 text-lg font-bold group-hover:text-indigo-600">
      {course.title}
    </h2>
    <p class="line-clamp-2 text-sm text-slate-600">{course.description}</p>
    <div class="flex items-center gap-2 text-sm text-slate-600">
      <img
        src={getPhotoUrl(course.author.photo, course.author.name)}
        alt={course.author.name}
        width="24"
        height="24"
        loading="lazy"
        decoding="async"
        class="h-6 w-6 rounded-full object-cover"
      />
      <span>{course.author.name}</span>
    </div>
    <div class="mt-auto flex items-center gap-4 text-xs text-slate-600">
      <span class="flex items-center gap-1">
        <BookOpen class="h-4 w-4" />
        <span>{`${course.total_contents} materi`}</span>
      </span>
      <span class="flex items-center gap-1">
        <Users class="h-4 w-4" />
        <span>{`${course.students.length} peserta`}</span>
      </span>
      <span class="flex items-center gap-1">
        <Star class="h-4 w-4" />
        <span>{formatRating(course.avg_ratings)}</span>
      </span>
    </div>
  </div>
</a>
