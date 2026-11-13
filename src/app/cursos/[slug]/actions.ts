"use server";

import { redirect } from "next/navigation";
import { CheckoutError, startCheckout } from "@/lib/payments/orders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BuyState = { error: string | null };

export async function buyCourseAction(_prev: BuyState, formData: FormData): Promise<BuyState> {
  const slug = String(formData.get("slug") ?? "");
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "Curso inválido" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(`/cursos/${slug}`)}`);

  let checkoutUrl: string;
  try {
    checkoutUrl = await startCheckout({ userId: user.id, userEmail: user.email, courseSlug: slug });
  } catch (error) {
    if (error instanceof CheckoutError) {
      if (error.status === 409) redirect(`/mi-cuenta/cursos/${slug}`);
      return { error: error.message };
    }
    console.error("[checkout] error", error);
    return { error: "No pudimos iniciar el pago. Probá de nuevo en unos minutos." };
  }
  redirect(checkoutUrl);
}
