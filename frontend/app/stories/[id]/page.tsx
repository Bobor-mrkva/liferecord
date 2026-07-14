"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, API_URL, ApiError, Story, Translation } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import TranslateButton from "@/components/TranslateButton";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { locale, t } = useLanguage();
  const [story, setStory] = useState<Story | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(null);

  useEffect(() => {
    setStory(null);
    setNotFound(false);
    setTranslation(null);
    api
      .get<Story>(`/stories/${id}`)
      .then(setStory)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id]);

  useEffect(() => {
    setTranslation(null);
  }, [locale]);

  if (notFound) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="bg.page" minH="100vh" textAlign="center">
        <Text color="fg.muted">{t("storyPage.privateOrMissing")}</Text>
        <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }} mt={4}>
          <NextLink href="/stories">{t("storyPage.backToStories")}</NextLink>
        </Link>
      </Flex>
    );
  }

  if (!story) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="bg.page" minH="100vh">
        <Text color="fg.subtle">{t("common.loading")}</Text>
      </Flex>
    );
  }

  const isOwner = user?.id === story.user_id;
  const displayTitle = translation?.title ?? story.title;
  const displayContent = translation?.content ?? story.content;
  const displayAnswers = translation?.answers ?? story.answers;

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Box as="article" w="full" maxW="2xl" bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={8}>
        <Flex align="center" justify="space-between" gap={3} mb={2}>
          <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading">
            {displayTitle}
          </Heading>
          <Flex gap={3} flexShrink={0} align="flex-start">
            {isOwner && (
              <>
                <Link
                  href={`${API_URL}/stories/${story.id}/export`}
                  fontSize="sm"
                  color="brand.text"
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                  whiteSpace="nowrap"
                >
                  {t("storyPage.downloadPdf")}
                </Link>
                <Link
                  asChild
                  fontSize="sm"
                  color="brand.text"
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                  whiteSpace="nowrap"
                >
                  <NextLink href={`/stories/${story.id}/edit`}>{t("storyPage.edit")}</NextLink>
                </Link>
              </>
            )}
            <TranslateButton story={story} translation={translation} onTranslated={setTranslation} isOwner={isOwner} />
          </Flex>
        </Flex>
        <Text color="fg.subtle" fontSize="sm" mb={6}>
          {t("storyCard.by", { name: story.author_display_name ?? t("storyCard.anonymous") })}
        </Text>

        {story.mode === "freeform" ? (
          <Text color="fg.default" lineHeight="relaxed" whiteSpace="pre-wrap">
            {displayContent}
          </Text>
        ) : (
          <Flex direction="column" gap={6}>
            {displayAnswers?.map((a) => (
              <Box key={a.question_id}>
                <Heading as="h3" fontWeight="semibold" fontSize="md" color="fg.heading" mb={1}>
                  {a.prompt}
                </Heading>
                <Text color="fg.default" lineHeight="relaxed" whiteSpace="pre-wrap">
                  {a.answer}
                </Text>
              </Box>
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
