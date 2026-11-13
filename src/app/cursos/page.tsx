import type { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "Cursos" };

export default async function CoursesPage() {
  const courses = await listPublishedCourses().catch((error: unknown) => {
    console.error("[cursos] no se pudo cargar el catálogo", error);
    return [];
  });
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-serif text-4xl">Cursos</h1>
      <p className="mt-3 text-muted">Elegí por dónde empezar. Cada curso tiene clases grabadas y certificado al terminar.</p>
      {courses.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-line p-8 text-muted">Pronto vas a encontrar los cursos acá.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  );
}
