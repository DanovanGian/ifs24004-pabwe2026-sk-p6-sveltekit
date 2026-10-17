<script lang="ts">
  import { BookOpen, Star, Trash2, Users } from "lucide-svelte";
  import Avatar from "../../common/components/Avatar.svelte";
  import { getPhotoUrl } from "../../../helpers/toolsHelper";
  import type { Course } from "../api/courseApi";

  interface Props {
    course: Course;
    isOwner?: boolean;
    ondelete?: (course: Course) => void;
  }

  let { course, isOwner = false, ondelete = () => {} }: Props = $props();

  let coverBroken = $state(false);
  const cover = $derived(getPhotoUrl(course.cover));
  const rating = $derived(
    course.avg_ratings ? Number(course.avg_ratings).toFixed(1) : null
  );
</script>

<article
  class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
>
  <a href={`/courses/${course.id}`} class="block">
    {#if cover && !coverBroken}
      <img
        src={cover}
        alt={course.title}
        onerror={() => (coverBroken = true)}
        class="h-40 w-full object-cover"
      />
    {:else}
      <div
        class="flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-400"
      >
        <BookOpen size={40} />
      </div>
    {/if}
  </a>

  <div class="flex flex-1 flex-col p-4">
    <a href={`/courses/${course.id}`}>
      <h3 class="line-clamp-1 font-bold text-slate-900 hover:text-indigo-600">
        {course.title}
      </h3>
    </a>
    <p class="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>

    <div class="mt-3 flex items-center gap-2">
      <Avatar
        name={course.author.name}
        photo={course.author.photo}
        class="h-6 w-6 text-xs"
      />
      <span class="truncate text-xs text-slate-600">{course.author.name}</span>
    </div>

    <div class="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <Users size={14} />
          {course.students.length}
        </span>
        <span class="flex items-center gap-1">
          <BookOpen size={14} />
          {course.total_contents}
        </span>
        <span class="flex items-center gap-1">
          <Star size={14} class="text-amber-500" />
          {rating ?? "-"}
        </span>
      </div>

      {#if isOwner}
        <button
          type="button"
          aria-label="Hapus kursus"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          onclick={() => ondelete(course)}
        >
          <Trash2 size={16} />
        </button>
      {/if}
    </div>
  </div>
</article>
