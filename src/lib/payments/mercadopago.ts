import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { serverEnv } from "@/lib/env";

function client() {
  return new MercadoPagoConfig({
    accessToken: serverEnv().MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 10_000 },
  });
}

export type CheckoutItem = {
  orderId: string;
  courseSlug: string;
  title: string;
  amountArs: number;
  payerEmail?: string;
};

/** Creates a Checkout Pro preference and returns the URL to redirect the buyer to. */
export async function createCheckout(item: CheckoutItem): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const preference = await new Preference(client()).create({
    body: {
      items: [
        {
          id: item.courseSlug,
          title: item.title,
          quantity: 1,
          unit_price: item.amountArs,
          currency_id: "ARS",
        },
      ],
      payer: item.payerEmail ? { email: item.payerEmail } : undefined,
      external_reference: item.orderId,
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${siteUrl}/mi-cuenta?pago=aprobado`,
        pending: `${siteUrl}/mi-cuenta?pago=pendiente`,
        failure: `${siteUrl}/cursos/${item.courseSlug}?pago=rechazado`,
      },
      auto_return: "approved",
    },
    // The order id is unique, so retries of the same checkout reuse one preference.
    requestOptions: { idempotencyKey: item.orderId },
  });

  if (!preference.id || !preference.init_point) {
    throw new Error("Mercado Pago no devolvió la preferencia de pago");
  }
  return { preferenceId: preference.id, checkoutUrl: preference.init_point };
}

export type VerifiedPayment = {
  paymentId: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
};

/** Reads a payment straight from Mercado Pago: the webhook body itself is never trusted. */
export async function fetchPayment(paymentId: string): Promise<VerifiedPayment | null> {
  const payment = await new Payment(client()).get({ id: paymentId });
  if (!payment.id || !payment.external_reference || !payment.status) return null;
  return {
    paymentId: String(payment.id),
    orderId: payment.external_reference,
    status: payment.status,
    amount: payment.transaction_amount ?? 0,
    currency: payment.currency_id ?? "",
  };
}
