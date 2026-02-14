export type ThemeMode = "light" | "dark" | "auto";

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const actual = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
  root.dataset.theme = actual;
}
