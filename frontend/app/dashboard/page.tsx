"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) api.get<Story[]>("/stories/mine").then(setStories);
  }, [user]);

  if (authLoading || !user) return null;

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this story? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/stories/${id}`);
      setStories((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="amber.50" minH="100vh">
      <Box w="full" maxW="3xl">
        <Flex align="center" justify="space-between" mb={8}>
          <Box>
            <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={1}>
              My stories
            </Heading>
            <Text color="stone.500">Welcome back, {user.display_name}.</Text>
          </Box>
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
            <NextLink href="/stories/new">+ New story</NextLink>
          </Button>
        </Flex>

        {!stories ? (
          <Text color="stone.500">Loading...</Text>
        ) : stories.length === 0 ? (
          <Text color="stone.500">
            You haven&apos;t written any stories yet.{" "}
            <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
              <NextLink href="/stories/new">Start your first one</NextLink>
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
                <Box key={story.id} bg="white" border="1px solid" borderColor="amber.200" borderRadius="2xl" p={6}>
                  <Flex align="flex-start" justify="space-between" gap={4}>
                    <Box minW={0}>
                      <Flex align="center" gap={2} mb={2}>
                        <Heading as="h3" fontSize="xl" fontWeight="semibold" color="stone.900">
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
                          {story.visibility}
                        </Box>
                      </Flex>
                      <Text
                        color="stone.500"
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
                      <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/stories/${story.id}`}>View</NextLink>
                      </Link>
                      <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/stories/${story.id}/edit`}>Edit</NextLink>
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
                        {deletingId === story.id ? "Deleting..." : "Delete"}
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
