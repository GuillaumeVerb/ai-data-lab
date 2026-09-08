#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const locales = ["fr", "en"];
const contentDirs = ["projects", "labs", "writing", "learning", "observe"];
let failed = false;

function fail(message) {
  failed = true;
  console.error(`✗ ${message}`);
}

function keysOf(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.keys(value).flatMap((key) =>
    keysOf(value[key], prefix ? `${prefix}.${key}` : key),
  );
}

const frDict = JSON.parse(
  readFileSync(join(root, "content/dictionaries/fr.json"), "utf8"),
);
const enDict = JSON.parse(
  readFileSync(join(root, "content/dictionaries/en.json"), "utf8"),
);
const frKeys = keysOf(frDict).sort();
const enKeys = keysOf(enDict).sort();

for (const key of frKeys) {
  if (!enKeys.includes(key)) fail(`Missing EN dictionary key: ${key}`);
}
for (const key of enKeys) {
  if (!frKeys.includes(key)) fail(`Missing FR dictionary key: ${key}`);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    if (key) data[key] = value;
  }
  return data;
}

for (const dirName of contentDirs) {
  const dir = join(root, "content", dirName);
  if (!existsSync(dir)) {
    fail(`Missing content directory: content/${dirName}`);
    continue;
  }

  const files = readdirSync(dir).filter((file) => file.endsWith(".md"));
  const ids = new Map();

  for (const file of files) {
    const match = file.match(/^([a-z0-9-]+)\.(fr|en)\.md$/);
    if (!match) {
      fail(`Invalid filename: content/${dirName}/${file}`);
      continue;
    }
    const [, id, locale] = match;
    const raw = readFileSync(join(dir, file), "utf8");
    const data = parseFrontmatter(raw);
    if (data.content_id && data.content_id !== id) {
      fail(`${file}: content_id ${data.content_id} != ${id}`);
    }
    if (data.locale && data.locale !== locale) {
      fail(`${file}: locale ${data.locale} != ${locale}`);
    }
    if (!ids.has(id)) ids.set(id, new Set());
    ids.get(id).add(locale);
  }

  for (const [id, present] of ids) {
    for (const locale of locales) {
      if (!present.has(locale)) {
        fail(`Missing ${locale} for content/${dirName}/${id}`);
      }
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Translation completeness OK");
