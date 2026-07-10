"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { api, ApiError, Question, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StoryForm, { StoryFormValues } from "@/components/StoryForm";

export default function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    api
      .get<Story>(`/stories/${id}`)
      .then((s) => {
        if (user && s.user_id !== user.id) {
          setNotFound(true);
          return;
        }
        setStory(s);
        if (s.mode === "questions") {
          api.get<Question[]>("/questions").then(setQuestions);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id, user]);

  if (authLoading || !user) return null;

  if (notFound) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="amber.50" minH="100vh" textAlign="center">
        <Text color="stone.600">This story doesn&apos;t exist or isn&apos;t yours to edit.</Text>
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

  const initialAnswers: Record<number, string> = {};
  story.answers?.forEach((a) => {
    initialAnswers[a.question_id] = a.answer;
  });

  const handleSubmit = async (values: StoryFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await api.patch<Story>(`/stories/${story.id}`, {
        title: values.title,
        visibility: values.visibility,
        content: story.mode === "freeform" ? values.content : undefined,
        answers:
          story.mode === "questions"
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
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={8}>
          Edit story
        </Heading>
        <Box bg="white" border="1px solid" borderColor="amber.200" borderRadius="2xl" p={8}>
          <StoryForm
            mode={story.mode}
            questions={questions}
            initialValues={{
              title: story.title,
              visibility: story.visibility,
              content: story.content ?? "",
              answers: initialAnswers,
            }}
            submitLabel="Save changes"
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Flex>
  );
}
