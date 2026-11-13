"use client";

import { useActionState } from "react";
import { sendMagicLinkAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(sendMagicLinkAction, {
    status: "idle",
    message: null,
  });

  if (state.status === "sent") {
    return <p className="rounded-2xl border border-ok p-6 text-ok">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm text-muted">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-line bg-ink-soft px-4 py-3 outline-none focus:border-gold"
          placeholder="tu@email.com"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold px-6 py-3 font-medium text-ink hover:bg-gold-strong disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Recibir enlace para ingresar"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-300">
          {state.message}
        </p>
      )}
    </form>
  );
}
