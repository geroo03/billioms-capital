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

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <section>
        <Link href="/mi-cuenta" className="text-sm text-muted hover:text-paper">
          ← Mis cursos
        </Link>
        <h1 className="mt-4 font-serif text-3xl">{course.title}</h1>

        {current ? (
          <>
            <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-line bg-ink-soft">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={current.title}
                  className="h-full w-full"
                  allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-muted">
                  {current.released
                    ? "El video de esta clase se publica pronto."
                    : `Esta clase se habilita el ${formatDate(current.releaseDate)}.`}
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">
                  Clase {current.position}: {current.title}
                </h2>
                {current.summary && <p className="mt-2 text-muted">{current.summary}</p>}
              </div>
              {current.released && (
                <form action={toggleLessonAction}>
                  <input type="hidden" name="lessonId" value={current.id} />
                  <input type="hidden" name="slug" value={course.slug} />
                  <input type="hidden" name="completed" value={String(completed.has(current.id))} />
                  <button className="rounded-full border border-gold px-4 py-2 text-sm text-gold hover:bg-gold hover:text-ink">
                    {completed.has(current.id) ? "Marcar como pendiente" : "Marcar como vista"}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <p className="mt-6 text-muted">Este curso todavía no tiene clases.</p>
        )}
      </section>

      <aside>
        <h2 className="text-sm uppercase tracking-widest text-muted">Clases</h2>
        <ol className="mt-4 space-y-2">
          {lessons.map((l) => {
            const isCurrent = l.id === current?.id;
            const content = (
              <>
                <span className={completed.has(l.id) ? "text-ok" : "text-gold"}>{completed.has(l.id) ? "✓" : l.position}</span>
                <span className="flex-1">
                  {l.title}
                  {!l.released && <span className="block text-xs text-muted">Se habilita el {formatDate(l.releaseDate)}</span>}
                </span>
              </>
            );
            const className = `flex gap-3 rounded-xl border p-3 text-sm ${isCurrent ? "border-gold" : "border-line"} ${l.released ? "hover:border-gold" : "opacity-60"}`;
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
