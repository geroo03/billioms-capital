import { describe, expect, it } from "vitest";
import { decidePayment } from "@/lib/payments/apply-payment";

const pendingOrder = { status: "pending" as const, amountArs: 60000 };

describe("decidePayment", () => {
  it("grants access when an approved payment matches amount and currency", () => {
    expect(decidePayment(pendingOrder, { status: "approved", amount: 60000, currency: "ARS" })).toEqual({
      kind: "grant",
      orderStatus: "approved",
    });
  });

  it("rejects an approved payment for less than the order amount", () => {
    expect(decidePayment(pendingOrder, { status: "approved", amount: 100, currency: "ARS" }).kind).toBe("reject");
  });

  it("rejects an approved payment in another currency", () => {
    expect(decidePayment(pendingOrder, { status: "approved", amount: 60000, currency: "USD" }).kind).toBe("reject");
  });

  it("does not downgrade a paid order when a late pending notification arrives", () => {
    expect(
      decidePayment({ status: "approved", amountArs: 60000 }, { status: "in_process", amount: 60000, currency: "ARS" }),
    ).toEqual({ kind: "update", orderStatus: "approved" });
  });

  it("revokes access on refund and chargeback", () => {
    const paid = { status: "approved" as const, amountArs: 60000 };
    expect(decidePayment(paid, { status: "refunded", amount: 60000, currency: "ARS" }).kind).toBe("revoke");
    expect(decidePayment(paid, { status: "charged_back", amount: 60000, currency: "ARS" }).kind).toBe("revoke");
  });

  it("marks a rejected payment without granting", () => {
    expect(decidePayment(pendingOrder, { status: "rejected", amount: 60000, currency: "ARS" })).toEqual({
      kind: "update",
      orderStatus: "rejected",
    });
  });

  it("rejects unknown statuses", () => {
    expect(decidePayment(pendingOrder, { status: "weird", amount: 60000, currency: "ARS" }).kind).toBe("reject");
  });
});
