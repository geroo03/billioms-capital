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
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-soft p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/50 bg-ink font-serif text-xl uppercase text-gold" aria-hidden="true">
              {(user.email ?? "?").charAt(0)}
            </span>
            <div>
              <h1 className="font-serif text-3xl">¡Hola!</h1>
              <p className="mt-1 text-sm text-muted">
                {user.email} · {enrollments.length} {enrollments.length === 1 ? "curso" : "cursos"}
              </p>
            </div>
          </div>
          <form action={signOutAction}>
            <button className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-paper hover:text-paper">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {pago === "aprobado" && (
        <p role="status" className="mt-6 rounded-xl border border-ok/40 bg-ok/10 p-4 text-ok">
          ¡Pago recibido! Si el curso todavía no aparece, actualizá la página en unos segundos.
        </p>
      )}
      {pago === "pendiente" && (
        <p role="status" className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 text-gold">
          Tu pago está pendiente. Te habilitamos el curso apenas Mercado Pago lo confirme.
        </p>
      )}

      <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Tus cursos</h2>
      {enrollments.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-ink-soft p-8">
          <p className="text-muted">Todavía no tenés cursos.</p>
          <Link href="/cursos" className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-gold-strong">
            Ver cursos disponibles
          </Link>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {enrollments.map(({ course, completedLessons, totalLessons }) => {
            const pct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const done = totalLessons > 0 && completedLessons === totalLessons;
            return (
              <li key={course.id} className="rounded-2xl border border-line bg-ink-soft p-6 transition hover:border-gold/60">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${done ? "text-ok" : "text-gold"}`}>
                    {done ? "Completado" : course.level === "avanzado" ? "Nivel avanzado" : "En curso"}
                  </p>
                  <span className={`tabular rounded-md px-2 py-0.5 text-xs font-semibold ${done ? "bg-ok/15 text-ok" : "bg-gold/10 text-gold"}`}>
                    {pct}%
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{course.title}</h3>
                <div className="mt-4 h-1.5 rounded-full bg-line" aria-hidden="true">
                  <div className={`h-full rounded-full ${done ? "bg-ok" : "bg-gold"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <span>
                    {completedLessons} de {totalLessons} clases
                  </span>
                  <span className={done ? "text-ok" : ""}>{done ? "¡Terminado!" : `${totalLessons - completedLessons} restantes`}</span>
                </div>
                <Link
                  href={`/mi-cuenta/cursos/${course.slug}`}
                  className={`mt-5 block rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
                    done ? "border border-line hover:border-gold" : "bg-gold text-ink hover:bg-gold-strong"
                  }`}
                >
                  {done ? "Volver a ver" : "▶ Continuar curso"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
