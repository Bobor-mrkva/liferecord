"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { api, ApiError, Question, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import StoryForm, { StoryFormValues } from "@/components/StoryForm";

export default function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
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
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="bg.page" minH="100vh" textAlign="center">
        <Text color="fg.muted">{t("editStory.notFound")}</Text>
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
        is_anonymous: values.is_anonymous,
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
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
      setSubmitting(false);
    }
  };

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Box w="full" maxW="2xl">
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={8}>
          {t("editStory.title")}
        </Heading>
        <Box bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={8}>
          <StoryForm
            mode={story.mode}
            questions={questions}
            initialValues={{
              title: story.title,
              visibility: story.visibility,
              is_anonymous: story.is_anonymous,
              content: story.content ?? "",
              answers: initialAnswers,
            }}
            submitLabel={t("editStory.saveChanges")}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Flex>
  );
}
