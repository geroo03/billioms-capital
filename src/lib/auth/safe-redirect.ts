/** Only allow same-site relative paths, so `?next=` cannot send users to another domain. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/mi-cuenta"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
