"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, ApiError, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<Story>(`/stories/${id}`)
      .then(setStory)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id]);

  if (notFound) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="amber.50" minH="100vh" textAlign="center">
        <Text color="stone.600">This story is private or doesn&apos;t exist.</Text>
        <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }} mt={4}>
          <NextLink href="/stories">Back to stories</NextLink>
        </Link>
      </Flex>
    );
  }

  if (!story) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="amber.50" minH="100vh">
        <Text color="stone.500">Loading...</Text>
      </Flex>
    );
  }

  const isOwner = user?.id === story.user_id;

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="amber.50" minH="100vh">
      <Box as="article" w="full" maxW="2xl" bg="white" border="1px solid" borderColor="amber.200" borderRadius="2xl" p={8}>
        <Flex align="center" justify="space-between" gap={3} mb={6}>
          <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900">
            {story.title}
          </Heading>
          {isOwner && (
            <Link
              asChild
              fontSize="sm"
              color="amber.800"
              _hover={{ textDecoration: "underline" }}
              whiteSpace="nowrap"
            >
              <NextLink href={`/stories/${story.id}/edit`}>Edit</NextLink>
            </Link>
          )}
        </Flex>

        {story.mode === "freeform" ? (
          <Text color="stone.700" lineHeight="relaxed" whiteSpace="pre-wrap">
            {story.content}
          </Text>
        ) : (
          <Flex direction="column" gap={6}>
            {story.answers?.map((a) => (
              <Box key={a.question_id}>
                <Heading as="h3" fontWeight="semibold" fontSize="md" color="stone.900" mb={1}>
                  {a.prompt}
                </Heading>
                <Text color="stone.700" lineHeight="relaxed" whiteSpace="pre-wrap">
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
