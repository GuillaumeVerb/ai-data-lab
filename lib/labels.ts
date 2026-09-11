import type { Dictionary } from "@/lib/dictionary";
import type { ExperienceEntry, Project } from "@/lib/content";

export function projectKicker(item: Project, dict: Dictionary): string {
  if (item.flagship) return dict.projects.flagship;
  return item.domain === "applied_ai" ? dict.projects.applied : dict.projects.core;
}

export function evidenceLabel(item: ExperienceEntry, dict: Dictionary): string {
  return dict.experience.types[item.evidence_type];
}
