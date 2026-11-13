const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Lessons unlock a fixed number of days after enrollment, which lets the
 * client release recorded classes "on Tuesdays and Thursdays" without
 * running anything live.
 */
export function lessonReleaseDate(enrolledAt: Date, releaseOffsetDays: number): Date {
  return new Date(enrolledAt.getTime() + releaseOffsetDays * DAY_MS);
}

export function isLessonReleased(enrolledAt: Date, releaseOffsetDays: number, now: Date = new Date()): boolean {
  return lessonReleaseDate(enrolledAt, releaseOffsetDays).getTime() <= now.getTime();
}

export function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long" }).format(date);
}
