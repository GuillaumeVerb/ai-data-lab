export const site = {
  name: "AI Research & Engineering Lab",
  shortName: "The Lab",
  github: "https://github.com/GuillaumeVerb/ai-data-lab",
  githubProfile: "https://github.com/GuillaumeVerb",
  linkedin: "https://www.linkedin.com/in/guillaume-v-4832401b4",
  malt: "https://www.malt.fr/profile/guillaumeverbiguie",
  author: "Guillaume Verbiguié",
  location: "Paris",
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
  { key: "experience", href: "/experience" },
  { key: "about", href: "/about" },
] as const;
