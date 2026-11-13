import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listMyEnrollments } from "@/lib/courses";
import { signOutAction } from "./actions";

export const metadata: Metadata = { title: "Mi cuenta" };

type Props = { searchParams: Promise<{ pago?: string }> };

export default async function AccountPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/mi-cuenta");
  const [{ pago }, enrollments] = await Promise.all([searchParams, listMyEnrollments(user.id)]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Mis cursos</h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <button className="text-sm text-muted hover:text-paper">Cerrar sesión</button>
        </form>
      </div>

      {pago === "aprobado" && (
        <p className="mt-8 rounded-lg border border-ok p-4 text-ok">
          ¡Pago recibido! Si el curso todavía no aparece, actualizá la página en unos segundos.
        </p>
      )}
      {pago === "pendiente" && (
        <p className="mt-8 rounded-lg border border-gold p-4 text-gold">
          Tu pago está pendiente. Te habilitamos el curso apenas Mercado Pago lo confirme.
        </p>
      )}

      {enrollments.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line p-8">
          <p className="text-muted">Todavía no tenés cursos.</p>
          <Link href="/cursos" className="mt-4 inline-block text-gold hover:underline">
            Ver cursos disponibles →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {enrollments.map(({ course, completedLessons, totalLessons }) => {
            const pct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
            return (
              <li key={course.id}>
                <Link
                  href={`/mi-cuenta/cursos/${course.slug}`}
                  className="block rounded-2xl border border-line bg-ink-soft p-6 hover:border-gold"
                >
                  <h2 className="font-serif text-2xl">{course.title}</h2>
                  <div className="mt-5 h-2 rounded-full bg-line" aria-hidden>
                    <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {completedLessons} de {totalLessons} clases · {pct}%
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
