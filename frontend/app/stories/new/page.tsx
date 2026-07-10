"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { api, ApiError, Question, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StoryForm, { StoryFormValues } from "@/components/StoryForm";

export default function NewStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"freeform" | "questions" | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (mode === "questions" && questions.length === 0) {
      api.get<Question[]>("/questions").then(setQuestions);
    }
  }, [mode, questions.length]);

  if (authLoading || !user) return null;

  const handleSubmit = async (values: StoryFormValues) => {
    if (!mode) return;
    setError(null);
    setSubmitting(true);
    try {
      const story = await api.post<Story>("/stories", {
        mode,
        visibility: values.visibility,
        title: values.title,
        content: mode === "freeform" ? values.content : undefined,
        answers:
          mode === "questions"
            ? Object.entries(values.answers).map(([question_id, answer]) => ({
                question_id: Number(question_id),
                answer,
              }))
            : undefined,
      });
      router.push(`/stories/${story.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="amber.50" minH="100vh">
      <Box w="full" maxW="2xl">
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={2}>
          Write a new story
        </Heading>
        <Text color="stone.500" mb={8}>
          Choose how you&apos;d like to share, then write at your own pace.
        </Text>

        {!mode ? (
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
            <Button
              onClick={() => setMode("freeform")}
              variant="plain"
              textAlign="left"
              display="block"
              h="auto"
              bg="white"
              border="1px solid"
              borderColor="amber.200"
              borderRadius="2xl"
              p={6}
              _hover={{ borderColor: "amber.400" }}
              transition="border-color 0.2s"
            >
              <Heading as="h2" fontSize="xl" fontWeight="semibold" color="stone.900" mb={2}>
                Free-form life story
              </Heading>
              <Text color="stone.500" fontSize="sm" fontWeight="normal">
                Write your story in your own words, at your own pace.
              </Text>
            </Button>
            <Button
              onClick={() => setMode("questions")}
              variant="plain"
              textAlign="left"
              display="block"
              h="auto"
              bg="white"
              border="1px solid"
              borderColor="amber.200"
              borderRadius="2xl"
              p={6}
              _hover={{ borderColor: "amber.400" }}
              transition="border-color 0.2s"
            >
              <Heading as="h2" fontSize="xl" fontWeight="semibold" color="stone.900" mb={2}>
                Lessons learned
              </Heading>
              <Text color="stone.500" fontSize="sm" fontWeight="normal">
                Answer a few reflective questions to help others learn from your experience.
              </Text>
            </Button>
          </Grid>
        ) : (
          <Box bg="white" border="1px solid" borderColor="amber.200" borderRadius="2xl" p={8}>
            <Button
              onClick={() => setMode(null)}
              variant="plain"
              fontSize="sm"
              color="amber.800"
              _hover={{ textDecoration: "underline" }}
              mb={6}
              px={0}
              h="auto"
            >
              ← Choose a different way to write
            </Button>
            <StoryForm
              mode={mode}
              questions={questions}
              submitLabel="Publish story"
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
            />
          </Box>
        )}
      </Box>
    </Flex>
  );
}
