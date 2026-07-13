"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { api, Story } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import StoryCard from "@/components/StoryCard";
import StoryTypeTabs from "@/components/StoryTypeTabs";

export default function PublicStoriesPage() {
  const [stories, setStories] = useState<Story[] | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    api.get<Story[]>("/stories?mode=freeform").then(setStories);
  }, []);

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Box w="full" maxW="3xl">
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={2}>
          {t("publicStories.lifeStoriesTitle")}
        </Heading>
        <Text color="fg.subtle" mb={4}>
          {t("publicStories.lifeStoriesSubtitle")}
        </Text>
        <StoryTypeTabs active="freeform" freeformHref="/stories" questionsHref="/lessons" />

        {!stories ? (
          <Text color="fg.subtle">{t("common.loading")}</Text>
        ) : stories.length === 0 ? (
          <Text color="fg.subtle">{t("publicStories.lifeStoriesEmpty")}</Text>
        ) : (
          <Flex direction="column" gap={4}>
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
