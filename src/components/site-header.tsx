import Link from "next/link";
import { getCurrentUser } from "@/lib/courses";

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl tracking-wide">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold font-serif text-sm text-ink" aria-hidden="true">BC</span>
          <span>Billions <span className="text-gold">Capital</span></span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/cursos" className="text-muted hover:text-paper">
            Cursos
          </Link>
          {user ? (
            <Link href="/mi-cuenta" className="rounded-full border border-gold px-4 py-1.5 text-gold hover:bg-gold hover:text-ink">
              Mi cuenta
            </Link>
          ) : (
            <Link href="/ingresar" className="rounded-full bg-gold px-4 py-1.5 font-medium text-ink hover:bg-gold-strong">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
