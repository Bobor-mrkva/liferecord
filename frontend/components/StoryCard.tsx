import NextLink from "next/link";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { Story } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function StoryCard({
  story,
  showVisibility,
}: {
  story: Story;
  showVisibility?: boolean;
}) {
  const { t } = useLanguage();
  const preview =
    story.mode === "freeform"
      ? story.content
      : story.answers?.map((a) => a.answer).join(" ");

  return (
    <Link
      asChild
      display="block"
      bg="bg.surface"
      border="1px solid"
      borderColor="border.default"
      borderRadius="2xl"
      p={6}
      _hover={{ borderColor: "amber.400" }}
      transition="border-color 0.2s"
    >
      <NextLink href={`/stories/${story.id}`}>
        <Flex align="center" gap={2} mb={1}>
          <Heading as="h3" fontSize="xl" fontWeight="semibold" color="fg.heading">
            {story.title}
          </Heading>
          {showVisibility && (
            <Box
              as="span"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="full"
              bg={story.visibility === "public" ? "amber.100" : "stone.100"}
              color={story.visibility === "public" ? "amber.800" : "stone.600"}
            >
              {story.visibility}
            </Box>
          )}
        </Flex>
        <Text fontSize="sm" color="fg.subtle" mb={2}>
          {t("storyCard.by", { name: story.author_display_name ?? t("storyCard.anonymous") })}
        </Text>
        <Text
          color="fg.subtle"
          fontSize="sm"
          overflow="hidden"
          textOverflow="ellipsis"
          display="-webkit-box"
          css={{ WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
        >
          {preview}
        </Text>
      </NextLink>
    </Link>
  );
}
