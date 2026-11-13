import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Every page reads the visitor's session (header, prices, access), so nothing
// is prerendered at build time; this also lets the build run without secrets.
export const dynamic = "force-dynamic";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-playfair", display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Billions Capital | Cursos de finanzas e inversiones", template: "%s | Billions Capital" },
  description:
    "Cursos online de finanzas personales, inversiones y trading. Clases grabadas, a tu ritmo, con certificado al terminar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted sm:grid-cols-[2fr_1fr]">
            <div>
              <p className="font-serif text-lg text-paper">
                Billions <span className="text-gold">Capital</span>
              </p>
              <p className="mt-2 max-w-md">Cursos de finanzas, inversiones y negocios explicados en simple.</p>
            </div>
            <nav className="flex flex-col gap-2" aria-label="Pie de página">
              <Link href="/cursos" className="hover:text-paper">Cursos</Link>
              <Link href="/ingresar" className="hover:text-paper">Ingresar</Link>
              <Link href="/mi-cuenta" className="hover:text-paper">Mi cuenta</Link>
            </nav>
          </div>
          <div className="border-t border-line">
            <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted">
              © {new Date().getFullYear()} Billions Capital. El contenido es educativo y no constituye una recomendación de inversión.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
