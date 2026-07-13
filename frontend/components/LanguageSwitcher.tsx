"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { LOCALES, LOCALE_LABELS, LOCALE_NATIVE_NAMES, Locale } from "@/i18n/config";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = (l: Locale) => {
    setLocale(l);
    setOpen(false);
    if (user) {
      api.patch("/auth/preferences", { locale: l }).catch(() => {});
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
        aria-label="Change language"
        size="sm"
        variant="ghost"
        px={2}
        minW="auto"
        color="fg.muted"
        _hover={{ color: "brand.hover" }}
      >
        {LOCALE_LABELS[locale]}
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
          {LOCALES.map((l) => (
            <Button
              key={l}
              onClick={() => handleSelect(l)}
              variant="plain"
              w="full"
              justifyContent="flex-start"
              px={4}
              py={2}
              h="auto"
              borderRadius="none"
              fontWeight={l === locale ? "semibold" : "normal"}
              color="fg.default"
              _hover={{ bg: "amber.50" }}
            >
              {LOCALE_NATIVE_NAMES[l]}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
