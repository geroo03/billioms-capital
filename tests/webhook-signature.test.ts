import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isValidMercadoPagoSignature } from "@/lib/payments/webhook-signature";

const secret = "test-secret";
function sign(dataId: string, requestId: string, ts: string) {
  return createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
}

describe("isValidMercadoPagoSignature", () => {
  const ts = "1704908010";
  const requestId = "req-123";

  it("accepts a correctly signed notification", () => {
    const v1 = sign("123456", requestId, ts);
    expect(
      isValidMercadoPagoSignature({ signatureHeader: `ts=${ts},v1=${v1}`, requestId, dataId: "123456", secret }),
    ).toBe(true);
  });

  it("lowercases alphanumeric data ids before signing", () => {
    const v1 = sign("abc123", requestId, ts);
    expect(
      isValidMercadoPagoSignature({ signatureHeader: `ts=${ts},v1=${v1}`, requestId, dataId: "ABC123", secret }),
    ).toBe(true);
  });

  it("rejects a tampered data id", () => {
    const v1 = sign("123456", requestId, ts);
    expect(
      isValidMercadoPagoSignature({ signatureHeader: `ts=${ts},v1=${v1}`, requestId, dataId: "999999", secret }),
    ).toBe(false);
  });

  it("rejects missing or malformed headers", () => {
    expect(isValidMercadoPagoSignature({ signatureHeader: null, requestId, dataId: "1", secret })).toBe(false);
    expect(isValidMercadoPagoSignature({ signatureHeader: "garbage", requestId, dataId: "1", secret })).toBe(false);
    expect(isValidMercadoPagoSignature({ signatureHeader: `ts=${ts},v1=zz`, requestId, dataId: "1", secret })).toBe(false);
  });
});
