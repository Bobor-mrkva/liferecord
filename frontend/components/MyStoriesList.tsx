"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, API_URL, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import StoryTypeTabs from "@/components/StoryTypeTabs";

export default function MyStoriesList({
  mode,
  heading,
  emptyText,
}: {
  mode: "freeform" | "questions";
  heading: string;
  emptyText: string;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stories, setStories] = useState<Story[] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setStories(null);
    if (user) api.get<Story[]>(`/stories/mine?mode=${mode}`).then(setStories);
  }, [user, mode]);

  if (!user) return null;

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("myStoriesList.confirmDelete"))) return;
    setDeletingId(id);
    try {
      await api.delete(`/stories/${id}`);
      setStories((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Box w="full" maxW="3xl">
        <Flex align="center" justify="space-between" mb={2}>
          <Box>
            <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={1}>
              {heading}
            </Heading>
            <Text color="fg.subtle">{t("myStoriesList.welcomeBack", { name: user.display_name })}</Text>
          </Box>
          <Flex gap={3} align="center">
            <Link
              href={`${API_URL}/stories/export/all`}
              fontSize="sm"
              color="brand.text"
              fontWeight="medium"
              whiteSpace="nowrap"
              _hover={{ textDecoration: "underline" }}
            >
              {t("myStoriesList.downloadAllPdf")}
            </Link>
            <Button
              asChild
              bg="amber.800"
              color="amber.50"
              borderRadius="full"
              fontWeight="medium"
              px={5}
              py={3}
              h="auto"
              whiteSpace="nowrap"
              _hover={{ bg: "amber.900" }}
            >
              <NextLink href="/stories/new">{t("myStoriesList.newStory")}</NextLink>
            </Button>
          </Flex>
        </Flex>

        <StoryTypeTabs active={mode} freeformHref="/dashboard" questionsHref="/dashboard/lessons" />

        {!stories ? (
          <Text color="fg.subtle">{t("common.loading")}</Text>
        ) : stories.length === 0 ? (
          <Text color="fg.subtle">
            {emptyText}{" "}
            <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
              <NextLink href="/stories/new">{t("myStoriesList.startFirstOne")}</NextLink>
            </Link>
            .
          </Text>
        ) : (
          <Flex direction="column" gap={4}>
            {stories.map((story) => {
              const preview =
                story.mode === "freeform"
                  ? story.content
                  : story.answers?.map((a) => a.answer).join(" ");
              return (
                <Box key={story.id} bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={6}>
                  <Flex align="flex-start" justify="space-between" gap={4}>
                    <Box minW={0}>
                      <Flex align="center" gap={2} mb={2} wrap="wrap">
                        <Heading as="h3" fontSize="xl" fontWeight="semibold" color="fg.heading">
                          {story.title}
                        </Heading>
                        <Box
                          as="span"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          whiteSpace="nowrap"
                          bg={story.visibility === "public" ? "amber.100" : "stone.100"}
                          color={story.visibility === "public" ? "amber.800" : "stone.600"}
                        >
                          {story.visibility === "public" ? t("myStoriesList.publicBadge") : t("myStoriesList.privateBadge")}
                        </Box>
                        {story.is_anonymous && (
                          <Box
                            as="span"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            whiteSpace="nowrap"
                            bg="bg.subtle"
                            color="fg.muted"
                          >
                            {t("myStoriesList.anonymous")}
                          </Box>
                        )}
                      </Flex>
                      <Text
                        color="fg.subtle"
                        fontSize="sm"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        display="-webkit-box"
                        css={{ WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                      >
                        {preview}
                      </Text>
                    </Box>
                    <Flex gap={3} fontSize="sm" whiteSpace="nowrap">
                      <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/stories/${story.id}`}>{t("myStoriesList.view")}</NextLink>
                      </Link>
                      <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/stories/${story.id}/edit`}>{t("myStoriesList.edit")}</NextLink>
                      </Link>
                      <Link
                        href={`${API_URL}/stories/${story.id}/export`}
                        color="brand.text"
                        fontWeight="medium"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {t("myStoriesList.export")}
                      </Link>
                      <Button
                        onClick={() => handleDelete(story.id)}
                        disabled={deletingId === story.id}
                        variant="plain"
                        color="red.600"
                        fontWeight="medium"
                        px={0}
                        h="auto"
                        _hover={{ textDecoration: "underline" }}
                        _disabled={{ opacity: 0.5 }}
                      >
                        {deletingId === story.id ? t("myStoriesList.deleting") : t("myStoriesList.delete")}
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
