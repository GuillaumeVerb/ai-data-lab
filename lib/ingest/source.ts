import "server-only";

import { detectInputType, isBlockedHost } from "@/lib/ingest/detect";
import type { IngestInputType, SourceRef } from "@/lib/ingest/schema";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 1_200_000;

export type FetchedSource = {
  input_type: IngestInputType;
  source: SourceRef;
  text: string;
};

export async function fetchSource(input: string): Promise<FetchedSource> {
  const input_type = detectInputType(input);
  const collected_at = new Date().toISOString();

  if (input_type === "note" || input_type === "idea") {
    return {
      input_type,
      source: {
        source_id: `note:${collected_at}`,
        source_type: "note",
        collected_at,
      },
      text: input.trim(),
    };
  }

  const url = new URL(input.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }
  if (isBlockedHost(url.hostname)) {
    throw new Error("That host is not allowed");
  }

  if (input_type === "github") {
    return fetchGithub(url, collected_at);
  }
  if (input_type === "youtube") {
    return fetchYoutube(url, collected_at);
  }

  const html = await readUrl(url);
  const title = firstMatch(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description = firstMatch(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  const text = [title, description, stripHtml(html)].filter(Boolean).join("\n\n");

  return {
    input_type,
    source: {
      url: url.toString(),
      source_id: url.toString(),
      source_type: input_type === "paper" ? "paper" : guessWebSourceType(url),
      collected_at,
    },
    text: text.slice(0, 12_000),
  };
}

async function fetchGithub(url: URL, collected_at: string): Promise<FetchedSource> {
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/?/);
  if (!match) throw new Error("Not a GitHub repository URL");
  const [, owner, repo] = match;
  const api = `https://api.github.com/repos/${owner}/${repo}`;
  const meta = await readJson(api) as {
    full_name?: string;
    description?: string;
    license?: { spdx_id?: string };
    owner?: { login?: string };
  };
  let readme = "";
  try {
    readme = await readUrl(new URL(`${api}/readme`), {
      Accept: "application/vnd.github.raw",
    });
  } catch {
    readme = "";
  }

  const text = [`${meta.full_name ?? `${owner}/${repo}`}`, meta.description ?? "", readme]
    .filter(Boolean)
    .join("\n\n");

  return {
    input_type: "github",
    source: {
      url: `https://github.com/${owner}/${repo}`,
      source_id: `github:${owner}/${repo}`,
      source_type: "repo",
      author_or_org: meta.owner?.login ?? owner,
      collected_at,
      license_or_access: meta.license?.spdx_id,
    },
    text: text.slice(0, 12_000),
  };
}

async function fetchYoutube(url: URL, collected_at: string): Promise<FetchedSource> {
  const oembed = new URL("https://www.youtube.com/oembed");
  oembed.searchParams.set("url", url.toString());
  oembed.searchParams.set("format", "json");
  const data = await readJson(oembed.toString()) as {
    title?: string;
    author_name?: string;
  };

  return {
    input_type: "youtube",
    source: {
      url: url.toString(),
      source_id: url.toString(),
      source_type: "video",
      author_or_org: data.author_name,
      collected_at,
    },
    text: [data.title, data.author_name].filter(Boolean).join("\n"),
  };
}

function guessWebSourceType(url: URL): SourceRef["source_type"] {
  const host = url.hostname.replace(/^www\./, "");
  if (host.includes("arxiv") || host.includes("acm.org") || host.includes("ieee")) {
    return "paper";
  }
  if (host.endsWith(".gov") || host.includes("docs.")) return "official_docs";
  return "serious_media";
}

async function readUrl(url: URL, extraHeaders: Record<string, string> = {}): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "AI-Data-Lab Content Engine (https://github.com/GuillaumeVerb/ai-data-lab)",
        ...extraHeaders,
      },
    });
    if (!response.ok) {
      throw new Error(`Fetch failed (${response.status})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new Error("Source is too large");
    }
    return buffer.toString("utf8");
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(url: string): Promise<unknown> {
  const raw = await readUrl(new URL(url), { Accept: "application/json" });
  return JSON.parse(raw) as unknown;
}

function firstMatch(value: string, pattern: RegExp): string {
  return decode(value.match(pattern)?.[1] ?? "").trim();
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
