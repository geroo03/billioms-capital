import { createHash } from "node:crypto";

export type SignedEmbedInput = {
  libraryId: string;
  videoId: string;
  tokenKey: string;
  /** Unix seconds after which the URL stops working. */
  expiresAt: number;
};

/**
 * Builds a Bunny Stream embed URL protected by token authentication, so a
 * copied link stops working after `expiresAt`. Bunny's documented scheme is
 * SHA-256 hex of (token key + video id + expiration).
 */
export function signedEmbedUrl({ libraryId, videoId, tokenKey, expiresAt }: SignedEmbedInput): string {
  const token = createHash("sha256").update(`${tokenKey}${videoId}${expiresAt}`).digest("hex");
  const url = new URL(`https://iframe.mediadelivery.net/embed/${encodeURIComponent(libraryId)}/${encodeURIComponent(videoId)}`);
  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expiresAt));
  url.searchParams.set("autoplay", "false");
  return url.toString();
}
