import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { isLessonReleased } from "@/lib/schedule";
import { signedEmbedUrl } from "@/lib/video/bunny";

describe("isLessonReleased", () => {
  const enrolled = new Date("2026-11-10T12:00:00Z");
  it("releases offset 0 immediately", () => {
    expect(isLessonReleased(enrolled, 0, enrolled)).toBe(true);
  });
  it("keeps later lessons locked until their day", () => {
    expect(isLessonReleased(enrolled, 2, new Date("2026-11-11T12:00:00Z"))).toBe(false);
    expect(isLessonReleased(enrolled, 2, new Date("2026-11-12T12:00:00Z"))).toBe(true);
  });
});

describe("safeRedirectPath", () => {
  it("keeps same-site paths", () => {
    expect(safeRedirectPath("/cursos/trading")).toBe("/cursos/trading");
  });
  it("blocks external and protocol-relative targets", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/mi-cuenta");
    expect(safeRedirectPath("//evil.example")).toBe("/mi-cuenta");
    expect(safeRedirectPath("/\\evil.example")).toBe("/mi-cuenta");
    expect(safeRedirectPath(null)).toBe("/mi-cuenta");
  });
});

describe("signedEmbedUrl", () => {
  it("adds token and expiry", () => {
    const url = new URL(signedEmbedUrl({ libraryId: "1", videoId: "abc", tokenKey: "k", expiresAt: 100 }));
    expect(url.hostname).toBe("iframe.mediadelivery.net");
    expect(url.searchParams.get("expires")).toBe("100");
    expect(url.searchParams.get("token")).toMatch(/^[0-9a-f]{64}$/);
  });
});
