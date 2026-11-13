import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/courses";


const AUDIENCES = [
  {
    title: "Si nunca estudiaste finanzas",
    body: "Empezás desde cero, sin necesidad de un título. Aprendés a ordenar tu plata y a dar tus primeros pasos invirtiendo.",
  },
  {
    title: "Si ya estudiaste y querés más",
    body: "Cursos avanzados de trading, análisis y mercados para seguir capacitándote y aplicar lo que sabés.",
  },
];

const STEPS = [
  { title: "Elegís tu curso", body: "Pagás una sola vez con Mercado Pago, en pesos." },
  { title: "Cursás a tu ritmo", body: "Clases grabadas que se habilitan martes y jueves. Las mirás cuando quieras." },
  { title: "Terminás con certificado", body: "Al completar todas las clases recibís tu certificado." },
];

export default async function HomePage() {
  const courses = await listPublishedCourses().catch(() => []);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-28">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">Educación financiera</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
          Aprendé a manejar tu dinero e invertir, con alguien que lo hace todos los días.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Cursos de finanzas, inversiones y negocios explicados en simple, a precios accesibles.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/cursos" className="rounded-full bg-gold px-6 py-3 font-medium text-ink hover:bg-gold-strong">
            Ver cursos
          </Link>
          <a href="#como-funciona" className="rounded-full border border-line px-6 py-3 hover:border-paper">
            Cómo funciona
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:grid-cols-2">
        {AUDIENCES.map((a) => (
          <div key={a.title} className="rounded-2xl border border-line p-8">
            <h2 className="font-serif text-2xl">{a.title}</h2>
            <p className="mt-3 text-muted">{a.body}</p>
          </div>
        ))}
      </section>

      {courses.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl">Cursos</h2>
            <Link href="/cursos" className="text-sm text-gold hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      <section id="como-funciona" className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-serif text-3xl">Cómo funciona</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-serif text-4xl text-gold">{i + 1}</span>
                <h3 className="mt-2 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
