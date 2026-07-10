"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { api, Story } from "@/lib/api";
import StoryCard from "@/components/StoryCard";

export default function PublicStoriesPage() {
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    api.get<Story[]>("/stories").then(setStories);
  }, []);

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="amber.50" minH="100vh">
      <Box w="full" maxW="3xl">
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={2}>
          Stories from our community
        </Heading>
        <Text color="stone.500" mb={8}>
          Life stories and lessons, shared publicly.
        </Text>

        {!stories ? (
          <Text color="stone.500">Loading...</Text>
        ) : stories.length === 0 ? (
          <Text color="stone.500">No public stories yet. Be the first to share yours.</Text>
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
