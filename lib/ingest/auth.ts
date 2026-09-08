import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lab_admin";

export function adminSecret(): string | undefined {
  const value = process.env.ADMIN_SECRET?.trim();
  return value ? value : undefined;
}

export function adminToken(secret: string): string {
  return createHmac("sha256", secret).update("lab-admin-v1").digest("hex");
}

export function isValidAdminToken(token: string | undefined): boolean {
  const secret = adminSecret();
  if (!secret || !token) return false;
  const expected = Buffer.from(adminToken(secret));
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function passwordMatches(password: string): boolean {
  const secret = adminSecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(secret).digest();
  const received = createHmac("sha256", secret).update(password).digest();
  return timingSafeEqual(expected, received);
}
