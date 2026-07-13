"use client";

import { useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { api, ApiError, Story, Translation } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function TranslateButton({
  story,
  translation,
  onTranslated,
}: {
  story: Story;
  translation: Translation | null;
  onTranslated: (translation: Translation | null) => void;
}) {
  const { locale, t } = useLanguage();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  if (story.visibility !== "public" || story.language === locale) return null;

  const handleClick = async () => {
    if (translation) {
      onTranslated(null);
      setState("idle");
      return;
    }
    setState("loading");
    try {
      const result = await api.post<Translation>(`/stories/${story.id}/translate`, {
        target_language: locale,
      });
      onTranslated(result);
      setState("idle");
    } catch (err) {
      setState("error");
      if (!(err instanceof ApiError)) throw err;
    }
  };

  return (
    <Flex direction="column" align="flex-end" gap={1}>
      <Button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        variant="plain"
        h="auto"
        p={0}
        minW="auto"
        fontSize="sm"
        color="brand.text"
        fontWeight="medium"
        whiteSpace="nowrap"
        _hover={{ textDecoration: "underline" }}
        _disabled={{ opacity: 0.6 }}
      >
        {state === "loading" ? t("storyPage.translating") : translation ? t("storyPage.showOriginal") : t("storyPage.translate")}
      </Button>
      {state === "error" && (
        <Text fontSize="xs" color="red.600">
          {t("storyPage.translateUnavailable")}
        </Text>
      )}
    </Flex>
  );
}
