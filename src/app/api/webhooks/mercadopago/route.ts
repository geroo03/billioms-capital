import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { processPaymentNotification } from "@/lib/payments/orders";
import { isValidMercadoPagoSignature } from "@/lib/payments/webhook-signature";

export const runtime = "nodejs";

/**
 * Mercado Pago notification endpoint. It only trusts the payment id: the
 * payment itself is re-read from the Mercado Pago API before touching orders.
 */
export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type") ?? params.get("topic");
  const dataId = params.get("data.id") ?? params.get("id");

  const valid = isValidMercadoPagoSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
    secret: serverEnv().MERCADOPAGO_WEBHOOK_SECRET,
  });
  if (!valid) return NextResponse.json({ error: "firma inválida" }, { status: 401 });

  // Merchant orders and other topics are not used; acknowledge so they are not retried.
  if (type !== "payment" || !dataId) return NextResponse.json({ ok: true });

  try {
    const outcome = await processPaymentNotification(dataId);
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    console.error("[mercadopago] error procesando el pago", { dataId, error });
    // 500 makes Mercado Pago retry later, which is what we want for transient failures.
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
