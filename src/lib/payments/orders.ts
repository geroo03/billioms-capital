import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { decidePayment } from "./apply-payment";
import { createCheckout, fetchPayment } from "./mercadopago";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409,
  ) {
    super(message);
  }
}

/**
 * Starts a purchase. The price always comes from the database, never from
 * the browser, so a tampered request cannot buy a course for less.
 */
export async function startCheckout(params: { userId: string; userEmail?: string; courseSlug: string }) {
  const admin = createSupabaseAdminClient();

  const { data: course, error } = await admin
    .from("courses")
    .select("id, slug, title, price_ars, is_published")
    .eq("slug", params.courseSlug)
    .maybeSingle();
  if (error) throw new Error(`Error al buscar el curso: ${error.message}`);
  if (!course || !course.is_published) throw new CheckoutError("El curso no existe", 404);

  const { data: existing } = await admin
    .from("enrollments")
    .select("course_id")
    .eq("user_id", params.userId)
    .eq("course_id", course.id)
    .maybeSingle();
  if (existing) throw new CheckoutError("Ya tenés este curso", 409);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({ user_id: params.userId, course_id: course.id, amount_ars: course.price_ars })
    .select("id")
    .single();
  if (orderError) throw new Error(`No se pudo crear la orden: ${orderError.message}`);

  const { preferenceId, checkoutUrl } = await createCheckout({
    orderId: order.id,
    courseSlug: course.slug,
    title: `Curso: ${course.title}`,
    amountArs: course.price_ars,
    payerEmail: params.userEmail,
  });

  await admin.from("orders").update({ mp_preference_id: preferenceId }).eq("id", order.id);
  return checkoutUrl;
}

export type WebhookOutcome = "granted" | "revoked" | "updated" | "ignored";

/**
 * Applies a Mercado Pago payment to its order. Idempotent: Mercado Pago may
 * notify the same payment several times and in any order.
 */
export async function processPaymentNotification(paymentId: string): Promise<WebhookOutcome> {
  const payment = await fetchPayment(paymentId);
  // Payments from other integrations on the same account carry foreign references; skip them.
  if (!payment || !UUID_RE.test(payment.orderId)) return "ignored";

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, user_id, course_id, amount_ars, status")
    .eq("id", payment.orderId)
    .maybeSingle();
  if (error) throw new Error(`Error al buscar la orden: ${error.message}`);
  if (!order) {
    console.warn("[mercadopago] pago sin orden asociada", { paymentId });
    return "ignored";
  }

  const decision = decidePayment({ status: order.status, amountArs: order.amount_ars }, payment);
  if (decision.kind === "reject") {
    console.error("[mercadopago] pago rechazado por validación", { orderId: order.id, reason: decision.reason });
    return "ignored";
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: decision.orderStatus, mp_payment_id: payment.paymentId, updated_at: new Date().toISOString() })
    .eq("id", order.id);
  if (updateError) throw new Error(`No se pudo actualizar la orden: ${updateError.message}`);

  if (decision.kind === "grant") {
    const { error: enrollError } = await admin
      .from("enrollments")
      .upsert(
        { user_id: order.user_id, course_id: order.course_id, order_id: order.id },
        { onConflict: "user_id,course_id", ignoreDuplicates: true },
      );
    if (enrollError) throw new Error(`No se pudo inscribir al alumno: ${enrollError.message}`);
    return "granted";
  }

  if (decision.kind === "revoke") {
    const { error: revokeError } = await admin
      .from("enrollments")
      .delete()
      .eq("user_id", order.user_id)
      .eq("course_id", order.course_id)
      .eq("order_id", order.id);
    if (revokeError) throw new Error(`No se pudo quitar el acceso: ${revokeError.message}`);
    return "revoked";
  }

  return "updated";
}
