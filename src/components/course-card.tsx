import Link from "next/link";
import { formatArs } from "@/lib/schedule";
import type { CourseRow } from "@/lib/supabase/types";

const LEVEL_LABEL: Record<CourseRow["level"], string> = {
  inicial: "Para empezar de cero",
  avanzado: "Para profundizar",
};

export function CourseCard({ course }: { course: CourseRow }) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-ink-soft p-6 transition hover:border-gold"
    >
      <span className="text-xs uppercase tracking-widest text-gold">{LEVEL_LABEL[course.level]}</span>
      <h3 className="mt-3 font-serif text-2xl">{course.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{course.subtitle}</p>
      <div className="mt-6 flex items-end justify-between text-sm">
        <span className="text-muted">{Math.round(course.duration_weeks / 4)} meses</span>
        <span className="text-lg font-semibold">{formatArs(course.price_ars)}</span>
      </div>
    </Link>
  );
}
