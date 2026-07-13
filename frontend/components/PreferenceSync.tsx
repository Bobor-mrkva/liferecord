"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { isLocale } from "@/i18n/config";
import { isThemeMode } from "@/lib/theme-mode-config";

export default function PreferenceSync() {
  const { user } = useAuth();
  const { locale, setLocale } = useLanguage();
  const { mode, setMode } = useThemeMode();
  const appliedForUserId = useRef<number | null>(null);

  useEffect(() => {
    if (!user) {
      appliedForUserId.current = null;
      return;
    }
    if (appliedForUserId.current === user.id) return;
    appliedForUserId.current = user.id;

    if (isLocale(user.preferred_locale) && user.preferred_locale !== locale) {
      setLocale(user.preferred_locale);
    }
    if (isThemeMode(user.preferred_theme_mode) && user.preferred_theme_mode !== mode) {
      setMode(user.preferred_theme_mode);
    }
  }, [user, locale, mode, setLocale, setMode]);

  return null;
}
