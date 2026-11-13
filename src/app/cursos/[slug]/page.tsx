import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCurrentUser, getMyEnrollment } from "@/lib/courses";
import { formatArs } from "@/lib/schedule";
import { BuyButton } from "./buy-button";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ pago?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug);
  return course ? { title: course.title, description: course.subtitle } : {};
}

export default async function CoursePage({ params, searchParams }: Props) {
  const [{ slug }, { pago }] = await Promise.all([params, searchParams]);
  const course = await getCourseBySlug(slug);
  if (!course || !course.is_published) notFound();

  const user = await getCurrentUser();
  const enrollment = user ? await getMyEnrollment(user.id, course.id) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_340px]">
      <article>
        <Link href="/cursos" className="text-sm text-muted hover:text-paper">
          ← Todos los cursos
        </Link>
        <h1 className="mt-6 font-serif text-4xl sm:text-5xl">{course.title}</h1>
        <p className="mt-4 text-lg text-muted">{course.subtitle}</p>
        <p className="mt-8 leading-relaxed">{course.description}</p>

        <h2 className="mt-14 font-serif text-2xl">Temario</h2>
        <ol className="mt-6 divide-y divide-line rounded-2xl border border-line">
          {course.lessons.map((lesson) => (
            <li key={lesson.id} className="flex gap-4 p-5">
              <span className="font-serif text-xl text-gold">{lesson.position}</span>
              <div>
                <h3 className="font-medium">
                  {lesson.title}
                  {lesson.is_preview && <span className="ml-2 text-xs text-ok">Clase de muestra</span>}
                </h3>
                {lesson.summary && <p className="mt-1 text-sm text-muted">{lesson.summary}</p>}
              </div>
            </li>
          ))}
          {course.lessons.length === 0 && <li className="p-5 text-muted">El temario se publica pronto.</li>}
        </ol>
      </article>

      <aside className="h-fit rounded-2xl border border-line bg-ink-soft p-6 lg:sticky lg:top-6">
        <p className="text-3xl font-semibold">{formatArs(course.price_ars)}</p>
        <p className="mt-1 text-sm text-muted">Pago único · acceso a todas las clases</p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>{Math.round(course.duration_weeks / 4)} meses de cursada</li>
          <li>Clases nuevas martes y jueves</li>
          <li>Certificado al terminar</li>
        </ul>
        <div className="mt-6">
          {pago === "rechazado" && (
            <p role="alert" className="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-200">
              El pago no se completó. Podés intentar de nuevo.
            </p>
          )}
          {enrollment ? (
            <Link
              href={`/mi-cuenta/cursos/${course.slug}`}
              className="block rounded-full bg-gold px-6 py-3 text-center font-medium text-ink hover:bg-gold-strong"
            >
              Ir al curso
            </Link>
          ) : (
            <BuyButton slug={course.slug} label={user ? "Comprar curso" : "Ingresar y comprar"} />
          )}
        </div>
      </aside>
    </div>
  );
}
