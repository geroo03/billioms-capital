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
        className="w-full rounded-full bg-gold px-6 py-3 font-medium text-ink hover:bg-gold-strong disabled:opacity-60"
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
