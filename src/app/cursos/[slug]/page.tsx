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

  const levelLabel = course.level === "avanzado" ? "Nivel avanzado" : "Nivel inicial";
  const months = Math.max(1, Math.round(course.duration_weeks / 4));
  const totalMinutes = course.lessons.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  const chips = [levelLabel, `${months} meses · ${course.lessons.length} clases`, "Clases grabadas", "Certificado al terminar"];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10">
          <nav className="text-sm text-muted" aria-label="Ruta">
            <Link href="/cursos" className="hover:text-paper">
              Cursos
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gold">{course.title}</span>
          </nav>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Curso 100% online
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{course.subtitle}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c} className="rounded-full border border-line bg-ink-soft px-3 py-1.5 text-xs font-semibold text-paper/90">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Sobre el curso</p>
          <h2 className="mt-2 font-serif text-3xl">Qué vas a aprender</h2>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-paper/90">{course.description}</p>

          <div className="mt-14 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Contenido</p>
              <h2 className="mt-2 font-serif text-3xl">Temario del curso</h2>
            </div>
            <p className="text-sm text-muted">
              {course.lessons.length} clases{totalMinutes > 0 && ` · ${totalMinutes} min`}
            </p>
          </div>
          <ol className="mt-6 space-y-2 rounded-2xl border border-line bg-ink-soft p-3">
            {course.lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-4 rounded-xl bg-ink/60 px-4 py-3.5">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                    lesson.is_preview ? "bg-ok/15 text-ok" : "bg-gold/10 text-gold"
                  }`}
                >
                  {lesson.position}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {lesson.duration_minutes ? `${lesson.duration_minutes} min · ` : ""}
                    {lesson.release_offset_days === 0
                      ? "Disponible al inscribirte"
                      : `Se habilita a los ${lesson.release_offset_days} días`}
                  </p>
                </div>
                {lesson.is_preview && (
                  <span className="shrink-0 rounded-md bg-ok/15 px-2 py-1 text-xs font-semibold text-ok">Clase de muestra</span>
                )}
              </li>
            ))}
            {course.lessons.length === 0 && <li className="p-4 text-muted">El temario se publica pronto.</li>}
          </ol>
        </article>

        <aside className="h-fit rounded-2xl border border-line bg-ink-soft p-6 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pago único</p>
          <p className="tabular mt-1 font-serif text-4xl">
            {formatArs(course.price_ars)} <span className="font-sans text-sm font-semibold text-gold">ARS</span>
          </p>
          <div className="mt-6">
            {pago === "rechazado" && (
              <p role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-950/60 p-3 text-sm text-red-200">
                El pago no se completó. Podés intentar de nuevo.
              </p>
            )}
            {enrollment ? (
              <Link
                href={`/mi-cuenta/cursos/${course.slug}`}
                className="block rounded-full bg-gold px-6 py-3.5 text-center font-semibold text-ink transition hover:bg-gold-strong"
              >
                Ir al curso →
              </Link>
            ) : (
              <BuyButton slug={course.slug} label={user ? "Comprar con Mercado Pago" : "Ingresar y comprar"} />
            )}
          </div>
          <p className="mt-4 rounded-lg border border-line bg-ink/60 p-3 text-xs leading-relaxed text-muted">
            Pagás con Mercado Pago, en pesos, con los medios que tengas habilitados ahí.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[`${months} meses de cursada`, "Clases nuevas según el calendario del curso", "Acceso a todas las clases desde tu cuenta", "Certificado al terminar"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true">
                  <path d="M5 12l4 4L19 6" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
