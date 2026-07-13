export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const DEFAULT_THEME_MODE: ThemeMode = "light";
export const THEME_MODE_COOKIE = "lr_theme_mode";

export function isThemeMode(value: string | undefined | null): value is ThemeMode {
  return !!value && (THEME_MODES as readonly string[]).includes(value);
}

export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_MODE_COOKIE}=([^;]*)/);var mode=m?decodeURIComponent(m[1]):"${DEFAULT_THEME_MODE}";var isDark=mode==="dark"||(mode==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(isDark)document.documentElement.classList.add("dark");}catch(e){}})();`;
