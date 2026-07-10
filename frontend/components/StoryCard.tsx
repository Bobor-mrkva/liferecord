import NextLink from "next/link";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { Story } from "@/lib/api";

export default function StoryCard({
  story,
  showVisibility,
}: {
  story: Story;
  showVisibility?: boolean;
}) {
  const preview =
    story.mode === "freeform"
      ? story.content
      : story.answers?.map((a) => a.answer).join(" ");

  return (
    <Link
      asChild
      display="block"
      bg="white"
      border="1px solid"
      borderColor="amber.200"
      borderRadius="2xl"
      p={6}
      _hover={{ borderColor: "amber.400" }}
      transition="border-color 0.2s"
    >
      <NextLink href={`/stories/${story.id}`}>
        <Flex align="center" gap={2} mb={2}>
          <Heading as="h3" fontSize="xl" fontWeight="semibold" color="stone.900">
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
        <Text
          color="stone.500"
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
