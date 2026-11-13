"use client";

import { useActionState } from "react";
import { sendMagicLinkAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(sendMagicLinkAction, {
    status: "idle",
    message: null,
  });

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-ok/40 bg-ok/10 p-5">
        <p className="font-semibold text-ok">Revisá tu email</p>
        <p className="mt-1 text-sm text-paper/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-semibold">Tu correo electrónico</span>
        <span className="relative mt-2 block">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-line bg-[#0e1626] py-3.5 pl-12 pr-4 outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-1 focus:ring-gold"
            placeholder="nombre@ejemplo.com"
          />
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-ink transition hover:bg-gold-strong hover:shadow-[0_0_20px_rgba(212,166,74,0.25)] disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviarme el link de acceso →"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-300">
          {state.message}
        </p>
      )}
    </form>
  );
}
