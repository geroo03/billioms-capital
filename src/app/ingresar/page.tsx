import type { Metadata } from "next";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-4xl">Ingresar</h1>
      <p className="mt-3 text-muted">Sin contraseñas: te mandamos un enlace a tu email. Si es tu primera vez, se crea tu cuenta.</p>
      {error === "enlace" && (
        <p role="alert" className="mt-6 rounded-lg bg-red-950 p-3 text-sm text-red-200">
          El enlace venció o ya se usó. Pedí uno nuevo.
        </p>
      )}
      <div className="mt-8">
        <LoginForm next={safeRedirectPath(next)} />
      </div>
    </section>
  );
}
