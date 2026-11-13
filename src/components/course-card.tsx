import Link from "next/link";
import { formatArs } from "@/lib/schedule";
import type { CourseRow } from "@/lib/supabase/types";
import type { PlannedCourse } from "@/lib/planned-courses";

const LEVEL_LABEL: Record<CourseRow["level"], string> = {
  inicial: "Para empezar de cero",
  avanzado: "Para profundizar",
};

// Each level gets its own cover art so cards are recognisable without images.
function CardCover({ level, label }: { level: CourseRow["level"]; label: string }) {
  const advanced = level === "avanzado";
  return (
    <div
      className={`relative h-36 overflow-hidden ${
        advanced
          ? "bg-[radial-gradient(120%_120%_at_100%_0%,#3a2a0e_0%,#131c2e_55%)]"
          : "bg-[radial-gradient(120%_120%_at_0%_0%,#1d3a33_0%,#131c2e_60%)]"
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 144" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[36, 72, 108].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#24304a" strokeWidth="1" />
        ))}
        <path
          d={advanced ? "M0 120 L40 100 L70 108 L110 70 L150 82 L190 46 L230 58 L270 24 L320 30" : "M0 118 L50 110 L100 96 L150 90 L200 72 L250 64 L320 40"}
          fill="none"
          stroke={advanced ? "#e8bc5c" : "#4fb286"}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute left-4 top-4 rounded-full border border-paper/15 bg-ink/60 px-3 py-1 text-[11px] uppercase tracking-widest text-paper/90 backdrop-blur">
        {label}
      </span>
    </div>
  );
}

export function CourseCard({ course }: { course: CourseRow }) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft transition duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_20px_50px_-20px_rgba(212,166,74,0.35)]"
    >
      <CardCover level={course.level} label={LEVEL_LABEL[course.level]} />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-2xl">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{course.subtitle}</p>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-muted">{Math.max(1, Math.round(course.duration_weeks / 4))} meses · clases grabadas</span>
          <span className="text-lg font-semibold">{formatArs(course.price_ars)}</span>
        </div>
        <span className="mt-4 text-sm font-medium text-gold transition group-hover:translate-x-1">Ver el curso →</span>
      </div>
    </Link>
  );
}

export function PlannedCourseCard({ course }: { course: PlannedCourse }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
      <CardCover level={course.level} label={LEVEL_LABEL[course.level]} />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-2xl">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{course.blurb}</p>
        <div className="mt-6 border-t border-line pt-4">
          <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-gold">
            Próximamente
          </span>
        </div>
      </div>
    </div>
  );
}
