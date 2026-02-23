// InkFlow Design Tokens & Constants

export const SITE_NAME = "InkFlow";
export const SITE_DESCRIPTION =
  "Discover thoughtful writing from world-class authors on technology, culture, and design.";

// ─── Color Palette ──────────────────────────────────────

export const colors = {
  background: "#FDFBF7",
  foreground: "#1A1A2E",
  primary: "#3B49DF",
  primaryHover: "#2F3AB2",
  secondary: "#F5F5F5",
  accent: "#FF6154",
  muted: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
} as const;

// ─── Navigation Links ───────────────────────────────────

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Trending", href: "/trending" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Write", href: "/write" },
] as const;

// ─── Tag Colors ─────────────────────────────────────────

export const tagColors: Record<string, string> = {
  JavaScript: "#F7DF1E",
  "UI Design": "#A855F7",
  Productivity: "#10B981",
  "Remote Work": "#EF4444",
  Startup: "#F59E0B",
  React: "#61DAFB",
  "Next.js": "#000000",
  TypeScript: "#3178C6",
  CSS: "#264DE4",
  Python: "#3776AB",
};

// ─── Roles ──────────────────────────────────────────────

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
