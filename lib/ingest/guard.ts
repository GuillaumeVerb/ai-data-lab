import "server-only";

import { notFound, redirect } from "next/navigation";
import { localizedPath, type Locale } from "@/lib/i18n";
import { adminSecret, isAdminSession } from "@/lib/ingest/auth";

export async function requireAdmin(locale: Locale): Promise<void> {
  if (!adminSecret()) notFound();
  if (!(await isAdminSession())) {
    redirect(localizedPath(locale, "/admin/login"));
  }
}

export function requireAdminConfigured(): void {
  if (!adminSecret()) notFound();
}
