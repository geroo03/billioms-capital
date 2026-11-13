"use server";

import { z } from "zod";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { serverEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message: string | null };

const emailSchema = z.email();

/** Passwordless login: Supabase emails a one-time link that lands on /auth/callback. */
export async function sendMagicLinkAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { status: "error", message: "Ingresá un email válido." };

  const next = safeRedirectPath(String(formData.get("next") ?? ""));
  const callback = new URL("/auth/callback", serverEnv().NEXT_PUBLIC_SITE_URL);
  callback.searchParams.set("next", next);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: callback.toString(), shouldCreateUser: true },
  });
  if (error) {
    console.error("[auth] signInWithOtp", error.message);
    return { status: "error", message: "No pudimos enviar el enlace. Probá de nuevo en un minuto." };
  }
  return { status: "sent", message: `Te enviamos un enlace a ${parsed.data}. Abrilo desde este dispositivo.` };
}
