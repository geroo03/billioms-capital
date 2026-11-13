import { createHmac, timingSafeEqual } from "node:crypto";

export type WebhookSignatureInput = {
  /** Raw `x-signature` header, e.g. "ts=1704908010,v1=618c85…". */
  signatureHeader: string | null;
  /** Raw `x-request-id` header. */
  requestId: string | null;
  /** `data.id` query parameter of the notification URL. */
  dataId: string | null;
  secret: string;
};

/**
 * Verifies a Mercado Pago webhook. The manifest format and HMAC-SHA256 come
 * from Mercado Pago's "Webhooks > validate origin" docs. A failed check means
 * the request did not come from Mercado Pago, so the caller must not touch
 * any order. Replays are harmless: the handler re-reads the payment from the
 * Mercado Pago API and applies it idempotently.
 */
export function isValidMercadoPagoSignature({
  signatureHeader,
  requestId,
  dataId,
  secret,
}: WebhookSignatureInput): boolean {
  if (!signatureHeader || !requestId || !dataId) return false;

  const parts = new Map<string, string>();
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=", 2).map((s) => s.trim());
    if (key && value) parts.set(key, value);
  }
  const ts = parts.get("ts");
  const v1 = parts.get("v1");
  if (!ts || !v1 || !/^\d+$/.test(ts) || !/^[0-9a-f]+$/i.test(v1)) return false;

  const normalizedId = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${normalizedId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
