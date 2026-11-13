import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CourseRow, LessonRow } from "@/lib/supabase/types";

export type CourseWithLessons = CourseRow & { lessons: LessonRow[] };

export async function listPublishedCourses(): Promise<CourseRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar los cursos: ${error.message}`);
  return data;
}

export async function getCourseBySlug(slug: string): Promise<CourseWithLessons | null> {
  const supabase = await createSupabaseServerClient();
  const { data: course, error } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el curso: ${error.message}`);
  if (!course) return null;

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true });
  if (lessonsError) throw new Error(`No se pudo cargar el temario: ${lessonsError.message}`);

  return { ...course, lessons };
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type Enrollment = { course: CourseRow; enrolledAt: Date; completedLessons: number; totalLessons: number };

/** Courses the signed-in student bought, with progress. RLS limits rows to the student's own. */
export async function listMyEnrollments(userId: string): Promise<Enrollment[]> {
  const supabase = await createSupabaseServerClient();
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at")
    .eq("user_id", userId);
  if (error) throw new Error(`No se pudieron cargar tus cursos: ${error.message}`);
  if (enrollments.length === 0) return [];

  const courseIds = enrollments.map((e) => e.course_id);
  const [{ data: courses, error: cErr }, { data: lessons, error: lErr }, { data: progress, error: pErr }] =
    await Promise.all([
      supabase.from("courses").select("*").in("id", courseIds),
      supabase.from("lessons").select("id, course_id").in("course_id", courseIds),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId),
    ]);
  if (cErr || lErr || pErr) throw new Error("No se pudo cargar el avance de tus cursos");

  const done = new Set(progress.map((p) => p.lesson_id));
  return enrollments.flatMap((e) => {
    const course = courses.find((c) => c.id === e.course_id);
    if (!course) return [];
    const courseLessons = lessons.filter((l) => l.course_id === e.course_id);
    return [
      {
        course,
        enrolledAt: new Date(e.enrolled_at),
        totalLessons: courseLessons.length,
        completedLessons: courseLessons.filter((l) => done.has(l.id)).length,
      },
    ];
  });
}

export async function getMyEnrollment(userId: string, courseId: string): Promise<{ enrolledAt: Date } | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("enrolled_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw new Error(`No se pudo verificar la inscripción: ${error.message}`);
  return data ? { enrolledAt: new Date(data.enrolled_at) } : null;
}

export async function listMyCompletedLessonIds(userId: string, lessonIds: string[]): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  if (error) throw new Error(`No se pudo cargar tu avance: ${error.message}`);
  return new Set(data.map((d) => d.lesson_id));
}
