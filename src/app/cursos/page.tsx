import type { Metadata } from "next";
import { CourseCard, PlannedCourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/courses";
import { PLANNED_COURSES } from "@/lib/planned-courses";

export const metadata: Metadata = { title: "Cursos" };

export default async function CoursesPage() {
  const courses = await listPublishedCourses().catch((error: unknown) => {
    console.error("[cursos] no se pudo cargar el catálogo", error);
    return [];
  });
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Catálogo</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Cursos</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Elegí por dónde empezar. Cada curso tiene clases grabadas y certificado al terminar.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        {courses.length === 0 && (
          <p className="mb-8 text-sm text-muted">Estamos preparando los primeros cursos. Muy pronto vas a poder inscribirte.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.length > 0
            ? courses.map((c) => <CourseCard key={c.id} course={c} />)
            : PLANNED_COURSES.map((c) => <PlannedCourseCard key={c.title} course={c} />)}
        </div>
      </section>
    </>
  );
}
