import Link from "next/link";
import { CourseCard, PlannedCourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/courses";
import { PLANNED_COURSES, TOPICS } from "@/lib/planned-courses";

const AUDIENCES = [
  {
    tag: "Nivel inicial",
    title: "Si nunca estudiaste finanzas",
    body: "Empezás desde cero, sin necesidad de un título. Aprendés a ordenar tu plata y a dar tus primeros pasos invirtiendo.",
    points: ["Conceptos explicados en simple", "Ejemplos con la economía argentina", "Sin conocimientos previos"],
    icon: "M4 19h16M6 15l4-4 3 3 5-6",
  },
  {
    tag: "Nivel avanzado",
    title: "Si ya estudiaste y querés más",
    body: "Cursos avanzados de trading, análisis y mercados para seguir capacitándote y aplicar lo que sabés.",
    points: ["Trading y análisis técnico", "Gestión del riesgo", "Cursos de hasta 6 meses"],
    icon: "M4 19V5m0 14h16M8 15V11m4 4V8m4 7v-5",
  },
];

const STEPS = [
  { title: "Elegís tu curso", body: "Pagás una sola vez con Mercado Pago, en pesos y con los medios que ya usás." },
  { title: "Cursás a tu ritmo", body: "Las clases grabadas se habilitan según el calendario del curso y las mirás cuando quieras." },
  { title: "Terminás con certificado", body: "Al completar todas las clases recibís tu certificado del curso." },
];

const FEATURES = [
  { title: "Precios accesibles", body: "Cursos pensados para que cualquiera pueda empezar, pagando en pesos." },
  { title: "Clases cortas y claras", body: "Contenido directo, sin relleno, con ejemplos que podés aplicar." },
  { title: "Tu cuenta, tu progreso", body: "Entrás con tu email, marcás las clases vistas y retomás donde dejaste." },
  { title: "Acceso seguro", body: "Los videos solo se ven desde tu cuenta, con links protegidos." },
];

const FAQ = [
  {
    q: "¿Necesito saber algo antes de empezar?",
    a: "No para los cursos de nivel inicial. Están pensados para quien nunca estudió finanzas. Los avanzados indican qué conviene saber antes.",
  },
  {
    q: "¿Cómo pago?",
    a: "Con Mercado Pago, en pesos. Podés usar tarjeta, dinero en cuenta y los medios que Mercado Pago tenga habilitados. Apenas se aprueba el pago, el curso aparece en tu cuenta.",
  },
  {
    q: "¿Las clases son en vivo?",
    a: "Son clases grabadas que se van habilitando según el calendario del curso. Una vez habilitadas, las podés ver cuantas veces quieras.",
  },
  {
    q: "¿Cómo entro a mi cuenta?",
    a: "Con tu email. Te enviamos un link de acceso y entrás sin contraseña.",
  },
  {
    q: "¿Esto es asesoramiento de inversión?",
    a: "No. El contenido es educativo y no constituye una recomendación de inversión. Cada decisión es tuya.",
  },
];

function Icon({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Illustration of the student panel. It is decorative, so it is hidden from
// screen readers and shows example content rather than real data.
function PanelMock() {
  return (
    <div className="relative animate-float" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-gold/10 blur-3xl" />
      <div className="relative rounded-2xl border border-line bg-ink-soft/90 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5675a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          <span className="h-2.5 w-2.5 rounded-full bg-ok" />
          <span className="ml-3 text-xs text-muted">Mi cuenta · Billions Capital</span>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-4">
          <div className="col-span-3 rounded-xl border border-line bg-ink p-4">
            <p className="text-xs uppercase tracking-widest text-muted">Inversiones desde cero</p>
            <div className="mt-3 aspect-video rounded-lg bg-[radial-gradient(100%_100%_at_30%_20%,#22314f,#0b1220)] p-3">
              <svg viewBox="0 0 200 90" className="h-full w-full">
                <path d="M0 80 L30 70 L55 74 L85 52 L115 58 L145 32 L175 38 L200 14" fill="none" stroke="#e8bc5c" strokeWidth="2.5" strokeLinejoin="round" className="animate-draw" />
                <path d="M0 80 L30 70 L55 74 L85 52 L115 58 L145 32 L175 38 L200 14 L200 90 L0 90Z" fill="url(#g)" opacity="0.35" />
                <defs>
                  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#e8bc5c" />
                    <stop offset="1" stopColor="#e8bc5c" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="mt-3 text-sm">Clase 4 · Cómo armar tu primera cartera</p>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="rounded-xl border border-line bg-ink p-4">
              <p className="text-xs text-muted">Tu progreso</p>
              <p className="mt-1 font-serif text-3xl text-gold-gradient">62%</p>
              <div className="mt-3 h-1.5 rounded-full bg-line">
                <div className="h-full w-[62%] rounded-full bg-gold" />
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-line bg-ink p-4">
              <p className="text-xs text-muted">Próxima clase</p>
              <p className="mt-1 text-sm">Martes</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-center gap-2 text-paper/80"><span className="h-1.5 w-1.5 rounded-full bg-ok" />Clase 3 vista</li>
                <li className="flex items-center gap-2 text-paper/80"><span className="h-1.5 w-1.5 rounded-full bg-gold" />Clase 4 en curso</li>
                <li className="flex items-center gap-2 text-muted"><span className="h-1.5 w-1.5 rounded-full bg-line" />Clase 5 bloqueada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-4 hidden rounded-xl border border-line bg-ink-soft px-4 py-3 shadow-xl sm:block">
        <p className="text-xs text-muted">Pago aprobado</p>
        <p className="text-sm font-medium text-ok">Curso habilitado ✓</p>
      </div>
    </div>
  );
}

function CertificateMock() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-4 rounded-3xl bg-gold/10 blur-2xl" />
      <div className="relative rotate-[-2deg] rounded-xl bg-paper p-2 shadow-2xl">
        <div className="rounded-lg border-2 border-gold/60 px-6 py-8 text-center text-ink">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#8a6a25]">Billions Capital</p>
          <p className="mt-4 font-serif text-2xl">Certificado de finalización</p>
          <p className="mt-4 text-xs text-[#5b6577]">Se certifica que</p>
          <p className="mt-1 font-serif text-xl italic">Nombre del alumno</p>
          <p className="mt-3 text-xs text-[#5b6577]">completó el curso</p>
          <p className="mt-1 font-medium">Inversiones desde cero</p>
          <div className="mt-6 flex items-end justify-between text-[10px] text-[#5b6577]">
            <span className="border-t border-[#5b6577]/40 pt-1">Firma</span>
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-gold font-serif text-base text-[#8a6a25]">BC</span>
            <span className="border-t border-[#5b6577]/40 pt-1">Fecha</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const courses = await listPublishedCourses().catch(() => []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-soft/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              Educación financiera online
            </p>
            <h1 className="mt-6 font-serif text-4xl leading-[1.1] sm:text-6xl">
              Aprendé a manejar tu dinero e <span className="text-gold-gradient">invertir</span>, con alguien que lo hace todos los días.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Cursos de finanzas, inversiones y negocios explicados en simple, a precios accesibles y a tu ritmo.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/cursos" className="rounded-full bg-gold px-7 py-3.5 font-medium text-ink shadow-[0_10px_30px_-10px_rgba(212,166,74,0.7)] transition hover:bg-gold-strong">
                Ver cursos
              </Link>
              <a href="#como-funciona" className="rounded-full border border-line px-7 py-3.5 transition hover:border-paper">
                Cómo funciona
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {["Clases grabadas", "Certificado al terminar", "Pago con Mercado Pago"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon d="M5 12l4 4L19 6" className="h-4 w-4 text-ok" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <PanelMock />
        </div>
      </section>

      {/* Topics ticker */}
      <section className="overflow-hidden border-y border-line bg-ink-soft py-5" aria-label="Temas">
        <div className="flex w-max animate-ticker gap-10 whitespace-nowrap">
          {[...TOPICS, ...TOPICS].map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-serif text-xl text-paper/70" aria-hidden={i >= TOPICS.length}>
              {t}
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">Para quién es</p>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Un camino para cada punto de partida</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="group relative overflow-hidden rounded-2xl border border-line bg-ink-soft p-8 transition hover:border-gold/60">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/5 transition group-hover:bg-gold/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold">
                    <Icon d={a.icon} />
                  </span>
                  <span className="text-xs uppercase tracking-widest text-muted">{a.tag}</span>
                </div>
                <h3 className="mt-6 font-serif text-2xl">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{a.body}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <Icon d="M5 12l4 4L19 6" className="h-4 w-4 text-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">Cursos</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              {courses.length > 0 ? "Empezá por acá" : "Los primeros cursos"}
            </h2>
          </div>
          <Link href="/cursos" className="text-sm text-gold hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.length > 0
            ? courses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)
            : PLANNED_COURSES.map((c) => <PlannedCourseCard key={c.title} course={c} />)}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="scroll-mt-20 border-y border-line bg-ink-soft">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Cómo funciona</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Tres pasos, sin vueltas</h2>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 md:block" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative grid h-12 w-12 place-items-center rounded-full border border-gold/60 bg-ink font-serif text-xl text-gold">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features + certificate */}
      <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-24 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Por qué Billions Capital</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Aprendé con contenido claro y terminá con tu certificado</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-line p-5">
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
        <CertificateMock />
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <p className="text-center text-sm uppercase tracking-[0.25em] text-gold">Preguntas frecuentes</p>
          <h2 className="mt-3 text-center font-serif text-3xl sm:text-4xl">Lo que más nos preguntan</h2>
          <div className="mt-12 divide-y divide-line rounded-2xl border border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span className="faq-icon text-2xl leading-none text-gold transition">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-[radial-gradient(120%_140%_at_0%_0%,#3a2a0e_0%,#131c2e_55%,#0b1220_100%)] px-8 py-16 text-center sm:px-16">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl sm:text-5xl">Tu primer paso para hacer crecer tu dinero</h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">Elegí un curso, pagalo en pesos y empezá hoy.</p>
            <Link href="/cursos" className="mt-9 inline-block rounded-full bg-gold px-8 py-4 font-medium text-ink transition hover:bg-gold-strong">
              Ver los cursos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
