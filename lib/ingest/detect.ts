import type { IngestInputType } from "@/lib/ingest/schema";

export function detectInputType(input: string): IngestInputType {
  const value = input.trim();
  if (/^https?:\/\/(?:www\.)?github\.com\//i.test(value)) return "github";
  if (/youtube\.com|youtu\.be/i.test(value)) return "youtube";
  if (/arxiv\.org|doi\.org|\.pdf(\?|$)/i.test(value)) return "paper";
  if (/^https?:\/\//i.test(value)) return "url";
  if (value.length <= 120 && !value.includes("\n")) return "idea";
  return "note";
}

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.+$/, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]"
  ) {
    return true;
  }

  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }

  return false;
}
