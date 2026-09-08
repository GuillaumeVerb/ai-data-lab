export const site = {
  name: "AI Research & Engineering Lab",
  shortName: "The Lab",
  github: "https://github.com/GuillaumeVerb/ai-data-lab",
  githubProfile: "https://github.com/GuillaumeVerb",
  author: "Guillaume Verbiguie",
} as const;

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export const navItems = [
  { key: "projects", href: "/projects" },
  { key: "lab", href: "/lab" },
  { key: "writing", href: "/writing" },
  { key: "learning", href: "/learning" },
  { key: "observe", href: "/observe" },
  { key: "about", href: "/about" },
] as const;
