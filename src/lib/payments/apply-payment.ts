import type { OrderStatus } from "@/lib/supabase/types";

export type PaymentFacts = {
  status: string;
  amount: number;
  currency: string;
};

export type OrderFacts = {
  status: OrderStatus;
  amountArs: number;
};

export type PaymentDecision =
  | { kind: "grant"; orderStatus: "approved" }
  | { kind: "revoke"; orderStatus: "refunded" | "cancelled" }
  | { kind: "update"; orderStatus: OrderStatus }
  | { kind: "reject"; reason: string };

const MP_TO_ORDER: Record<string, OrderStatus> = {
  approved: "approved",
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
  in_mediation: "pending",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "refunded",
  charged_back: "refunded",
};

/**
 * Pure decision of what a Mercado Pago payment means for our order. Kept free
 * of I/O so the money rules can be unit-tested: access is granted only when
 * the approved amount and currency match what we charged.
 */
export function decidePayment(order: OrderFacts, payment: PaymentFacts): PaymentDecision {
  const next = MP_TO_ORDER[payment.status];
  if (!next) return { kind: "reject", reason: `estado desconocido: ${payment.status}` };

  if (next === "approved") {
    if (payment.currency !== "ARS") return { kind: "reject", reason: `moneda inesperada: ${payment.currency}` };
    if (Math.round(payment.amount) < order.amountArs) {
      return { kind: "reject", reason: `monto ${payment.amount} menor al de la orden ${order.amountArs}` };
    }
    return { kind: "grant", orderStatus: "approved" };
  }

  if (next === "refunded" || (next === "cancelled" && order.status === "approved")) {
    return { kind: "revoke", orderStatus: next === "refunded" ? "refunded" : "cancelled" };
  }

  // A late "pending" notification must not downgrade an order that is already paid.
  if (order.status === "approved") return { kind: "update", orderStatus: "approved" };
  return { kind: "update", orderStatus: next };
}
