import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, getCurrentUser, getMyEnrollment, listMyCompletedLessonIds } from "@/lib/courses";
import { serverEnv } from "@/lib/env";
import { formatDate, isLessonReleased, lessonReleaseDate } from "@/lib/schedule";
import { signedEmbedUrl } from "@/lib/video/bunny";
import { toggleLessonAction } from "../../actions";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ clase?: string }> };

export const metadata: Metadata = { title: "Clases" };

const EMBED_TTL_SECONDS = 2 * 60 * 60;

export default async function CoursePlayerPage({ params, searchParams }: Props) {
  const [{ slug }, { clase }] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();
  if (!user) redirect(`/ingresar?next=/mi-cuenta/cursos/${slug}`);

  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const enrollment = await getMyEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/cursos/${slug}`);

  const now = new Date();
  const lessons = course.lessons.map((l) => ({
    ...l,
    released: isLessonReleased(enrollment.enrolledAt, l.release_offset_days, now),
    releaseDate: lessonReleaseDate(enrollment.enrolledAt, l.release_offset_days),
  }));
  const completed = await listMyCompletedLessonIds(
    user.id,
    lessons.map((l) => l.id),
  );

  const current = lessons.find((l) => l.id === clase && l.released) ?? lessons.find((l) => l.released && !completed.has(l.id)) ?? lessons[0];

  let embedUrl: string | null = null;
  if (current?.released && current.video_id) {
    const env = serverEnv();
    embedUrl = signedEmbedUrl({
      libraryId: env.BUNNY_STREAM_LIBRARY_ID,
      videoId: current.video_id,
      tokenKey: env.BUNNY_STREAM_TOKEN_KEY,
      expiresAt: Math.floor(now.getTime() / 1000) + EMBED_TTL_SECONDS,
    });
  }

  const completedCount = lessons.filter((l) => completed.has(l.id)).length;
  const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0">
        <nav className="text-sm text-muted" aria-label="Ruta">
          <Link href="/mi-cuenta" className="hover:text-paper">
            Mis cursos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gold">{course.title}</span>
        </nav>

        {current ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-ink-soft">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs">
              <span className="flex items-center gap-2 font-semibold uppercase tracking-wider text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                {current.released ? "Reproduciendo" : "Próximamente"}
              </span>
              <span className="text-muted">
                Clase {current.position} de {lessons.length}
              </span>
            </div>
            <div className="aspect-video bg-[radial-gradient(100%_100%_at_50%_30%,#1b2740,#0b1220)]">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={current.title}
                  className="h-full w-full"
                  allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-muted">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-2xl text-gold" aria-hidden="true">
                    {current.released ? "▶" : "🔒"}
                  </span>
                  {current.released ? "El video de esta clase se publica pronto." : `Esta clase se habilita el ${formatDate(current.releaseDate)}.`}
                </div>
              )}
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">{course.title}</p>
              <h1 className="mt-2 font-serif text-2xl sm:text-3xl">
                Clase {current.position}: {current.title}
              </h1>
              {current.summary && <p className="mt-3 leading-relaxed text-muted">{current.summary}</p>}
              {current.released && (
                <form action={toggleLessonAction} className="mt-6">
                  <input type="hidden" name="lessonId" value={current.id} />
                  <input type="hidden" name="slug" value={course.slug} />
                  <input type="hidden" name="completed" value={String(completed.has(current.id))} />
                  <button
                    className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition ${
                      completed.has(current.id)
                        ? "border border-line text-muted hover:border-paper hover:text-paper"
                        : "bg-[#007d55] text-paper hover:bg-ok"
                    }`}
                  >
                    {completed.has(current.id) ? "Marcar como pendiente" : "✓ Marcar como vista"}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-line bg-ink-soft p-8 text-muted">Este curso todavía no tiene clases.</p>
        )}
      </section>

      <aside className="h-fit rounded-2xl border border-line bg-ink-soft lg:sticky lg:top-24">
        <div className="border-b border-line p-5">
          <div className="flex items-center justify-between text-sm">
            <h2 className="font-semibold">Temario</h2>
            <span className="tabular text-muted">
              {completedCount}/{lessons.length} vistas
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-line" aria-hidden="true">
            <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <ol className="space-y-1 p-2">
          {lessons.map((l) => {
            const isCurrent = l.id === current?.id;
            const isDone = completed.has(l.id);
            const badge = !l.released
              ? { text: formatDate(l.releaseDate), cls: "bg-line/60 text-muted" }
              : isCurrent
                ? { text: "En curso", cls: "bg-gold text-ink" }
                : isDone
                  ? { text: "Vista", cls: "bg-ok/15 text-ok" }
                  : { text: "Disponible", cls: "bg-line/60 text-paper/80" };
            const content = (
              <>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    isDone ? "bg-ok/15 text-ok" : isCurrent ? "bg-gold/20 text-gold" : "bg-line/60 text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {isDone ? "✓" : l.released ? l.position : "🔒"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${isCurrent ? "text-gold" : ""}`}>{l.title}</span>
                  <span className="block text-xs text-muted">
                    {l.duration_minutes ? `${l.duration_minutes} min` : `Clase ${l.position}`}
                  </span>
                </span>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.text}</span>
              </>
            );
            const className = `flex items-center gap-3 rounded-xl p-3 text-sm transition ${
              isCurrent ? "border-l-2 border-gold bg-gold/5" : ""
            } ${l.released ? "hover:bg-ink/60" : "opacity-60"}`;
            return (
              <li key={l.id}>
                {l.released ? (
                  <Link href={`?clase=${l.id}`} className={className} aria-current={isCurrent ? "true" : undefined}>
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
