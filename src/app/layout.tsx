import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Billions Capital | Cursos de finanzas e inversiones", template: "%s | Billions Capital" },
  description:
    "Cursos online de finanzas personales, inversiones y trading. Clases grabadas, a tu ritmo, con certificado al terminar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
            © {new Date().getFullYear()} Billions Capital. El contenido es educativo y no constituye una recomendación de inversión.
          </div>
        </footer>
      </body>
    </html>
  );
}
