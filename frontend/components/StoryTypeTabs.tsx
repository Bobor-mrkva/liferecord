"use client";

import NextLink from "next/link";
import { Button, Flex } from "@chakra-ui/react";
import { useLanguage } from "@/context/LanguageContext";

export default function StoryTypeTabs({
  active,
  freeformHref,
  questionsHref,
}: {
  active: "freeform" | "questions";
  freeformHref: string;
  questionsHref: string;
}) {
  const { t } = useLanguage();
  return (
    <Flex gap={3} mb={8}>
      <Button
        asChild
        borderRadius="full"
        border="1px solid"
        fontSize="sm"
        fontWeight="medium"
        transition="colors 0.2s"
        bg={active === "freeform" ? "amber.800" : "transparent"}
        color={active === "freeform" ? "amber.50" : "stone.600"}
        borderColor={active === "freeform" ? "amber.800" : "amber.200"}
        _hover={{ bg: active === "freeform" ? "amber.800" : "amber.100" }}
      >
        <NextLink href={freeformHref}>{t("storyTypeTabs.lifeStories")}</NextLink>
      </Button>
      <Button
        asChild
        borderRadius="full"
        border="1px solid"
        fontSize="sm"
        fontWeight="medium"
        transition="colors 0.2s"
        bg={active === "questions" ? "amber.800" : "transparent"}
        color={active === "questions" ? "amber.50" : "stone.600"}
        borderColor={active === "questions" ? "amber.800" : "amber.200"}
        _hover={{ bg: active === "questions" ? "amber.800" : "amber.100" }}
      >
        <NextLink href={questionsHref}>{t("storyTypeTabs.lessonsLearned")}</NextLink>
      </Button>
    </Flex>
  );
}
