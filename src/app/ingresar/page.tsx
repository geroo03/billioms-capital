import type { Metadata } from "next";
import Link from "next/link";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-line bg-ink-soft p-6 shadow-[0_20px_40px_-15px_rgba(5,8,15,0.7)] sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
            </svg>
            Acceso seguro a tu cuenta
          </p>
          <h1 className="mt-5 font-serif text-3xl">Ingresá a tu espacio de estudio</h1>
          <p className="mt-3 leading-relaxed text-muted">
            Sin contraseñas. Escribí tu email y te mandamos un link para entrar con un solo toque. Si es tu primera vez, se crea tu cuenta.
          </p>
          {error === "enlace" && (
            <p role="alert" className="mt-6 rounded-lg border border-red-400/30 bg-red-950/60 p-3 text-sm text-red-200">
              El link venció o ya se usó. Pedí uno nuevo.
            </p>
          )}
          <div className="mt-8">
            <LoginForm next={safeRedirectPath(next)} />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Sos nuevo en Billions Capital?{" "}
          <Link href="/cursos" className="font-medium text-gold hover:underline">
            Conocé los cursos →
          </Link>
        </p>
      </div>
    </section>
  );
}
