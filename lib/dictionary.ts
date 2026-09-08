import type { Locale } from "@/lib/i18n";
import fr from "@/content/dictionaries/fr.json";
import en from "@/content/dictionaries/en.json";

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
