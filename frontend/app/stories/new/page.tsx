"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { api, ApiError, Question, Story } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import StoryForm, { StoryFormValues } from "@/components/StoryForm";

export default function NewStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, locale } = useLanguage();
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
      await api.post<Story>("/stories", {
        mode,
        visibility: values.visibility,
        is_anonymous: values.is_anonymous,
        title: values.title,
        language: locale,
        content: mode === "freeform" ? values.content : undefined,
        answers:
          mode === "questions"
            ? Object.entries(values.answers).map(([question_id, answer]) => ({
                question_id: Number(question_id),
                answer,
              }))
            : undefined,
      });
      router.push(mode === "freeform" ? "/dashboard" : "/dashboard/lessons");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
      setSubmitting(false);
    }
  };

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Box w="full" maxW="2xl">
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={2}>
          {t("newStory.title")}
        </Heading>
        <Text color="fg.subtle" mb={8}>
          {t("newStory.subtitle")}
        </Text>

        {!mode ? (
          <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={4}>
            <Button
              onClick={() => setMode("freeform")}
              variant="plain"
              textAlign="left"
              display="block"
              h="auto"
              whiteSpace="normal"
              bg="bg.surface"
              border="1px solid"
              borderColor="border.default"
              borderRadius="2xl"
              p={6}
              _hover={{ borderColor: "amber.400" }}
              transition="border-color 0.2s"
            >
              <Heading as="h2" fontSize="xl" fontWeight="semibold" color="fg.heading" mb={2}>
                {t("newStory.freeformTitle")}
              </Heading>
              <Text color="fg.subtle" fontSize="sm" fontWeight="normal">
                {t("newStory.freeformDesc")}
              </Text>
            </Button>
            <Button
              onClick={() => setMode("questions")}
              variant="plain"
              textAlign="left"
              display="block"
              h="auto"
              whiteSpace="normal"
              bg="bg.surface"
              border="1px solid"
              borderColor="border.default"
              borderRadius="2xl"
              p={6}
              _hover={{ borderColor: "amber.400" }}
              transition="border-color 0.2s"
            >
              <Heading as="h2" fontSize="xl" fontWeight="semibold" color="fg.heading" mb={2}>
                {t("newStory.questionsTitle")}
              </Heading>
              <Text color="fg.subtle" fontSize="sm" fontWeight="normal">
                {t("newStory.questionsDesc")}
              </Text>
            </Button>
            <Button
              onClick={() => router.push("/family-tree")}
              variant="plain"
              textAlign="left"
              display="block"
              h="auto"
              whiteSpace="normal"
              bg="bg.surface"
              border="1px solid"
              borderColor="border.default"
              borderRadius="2xl"
              p={6}
              _hover={{ borderColor: "amber.400" }}
              transition="border-color 0.2s"
            >
              <Heading as="h2" fontSize="xl" fontWeight="semibold" color="fg.heading" mb={2}>
                {t("newStory.familyTreeTitle")}
              </Heading>
              <Text color="fg.subtle" fontSize="sm" fontWeight="normal">
                {t("newStory.familyTreeDesc")}
              </Text>
            </Button>
          </Grid>
        ) : (
          <Box bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={8}>
            <Button
              onClick={() => setMode(null)}
              variant="plain"
              fontSize="sm"
              color="brand.text"
              _hover={{ textDecoration: "underline" }}
              mb={6}
              px={0}
              h="auto"
            >
              {t("newStory.chooseDifferentWay")}
            </Button>
            <StoryForm
              mode={mode}
              questions={questions}
              submitLabel={t("newStory.publish")}
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
