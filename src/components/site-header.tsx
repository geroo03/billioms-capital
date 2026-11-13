import Link from "next/link";
import { getCurrentUser } from "@/lib/courses";

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl tracking-wide">
          Billions <span className="text-gold">Capital</span>
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
