"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { useThemeMode } from "@/context/ThemeModeContext";
import type { ThemeMode } from "@/lib/theme-mode-config";
import { THEME_MODES } from "@/lib/theme-mode-config";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const MODE_ICONS: Record<ThemeMode, string> = {
  light: "☀️",
  dark: "🌙",
  system: "🖥️",
};

export default function ModeSwitcher() {
  const { mode, setMode } = useThemeMode();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = (m: ThemeMode) => {
    setMode(m);
    setOpen(false);
    if (user) {
      api.patch("/auth/preferences", { theme_mode: m }).catch(() => {});
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <Box position="relative" ref={ref}>
      <Button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("themeMode.ariaLabel")}
        size="sm"
        variant="ghost"
        px={2}
        minW="auto"
        color="fg.muted"
        _hover={{ color: "brand.hover" }}
      >
        {MODE_ICONS[mode]}
      </Button>

      {open && (
        <Box
          position="absolute"
          left={0}
          mt={2}
          minW="36"
          bg="bg.surface"
          border="1px solid"
          borderColor="border.default"
          borderRadius="xl"
          boxShadow="lg"
          py={2}
          zIndex={10}
        >
          {THEME_MODES.map((m) => (
            <Button
              key={m}
              onClick={() => handleSelect(m)}
              variant="plain"
              w="full"
              justifyContent="flex-start"
              gap={2}
              px={4}
              py={2}
              h="auto"
              borderRadius="none"
              fontWeight={m === mode ? "semibold" : "normal"}
              color="fg.default"
              _hover={{ bg: "bg.page" }}
            >
              <Box as="span">{MODE_ICONS[m]}</Box>
              {t(`themeMode.${m}`)}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
