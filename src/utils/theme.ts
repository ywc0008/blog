import type { Theme } from "../types";

const THEME_KEY = "theme";

/**
 * Get the current theme from localStorage or system preference
 */
export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored) return stored;

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

/**
 * Set theme and persist to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): Theme {
  const current = getTheme();
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}

/**
 * Initialize theme on page load (prevents flash of unstyled content)
 * This should be called in a blocking script tag in the head
 */
export function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}
