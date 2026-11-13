"use client";

import { useActionState } from "react";
import { buyCourseAction, type BuyState } from "./actions";

export function BuyButton({ slug, label }: { slug: string; label: string }) {
  const [state, formAction, pending] = useActionState<BuyState, FormData>(buyCourseAction, { error: null });
  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-ink transition hover:bg-gold-strong hover:shadow-[0_0_20px_rgba(212,166,74,0.25)] disabled:opacity-60"
      >
        {pending ? "Redirigiendo a Mercado Pago…" : label}
      </button>
      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
    </form>
  );
}
