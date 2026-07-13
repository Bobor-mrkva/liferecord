"use client";

import { useState } from "react";
import { Box, Button, Fieldset, Flex, Input, Text } from "@chakra-ui/react";
import { api, ApiError, Question } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import VoiceTextarea from "@/components/VoiceTextarea";

export type StoryFormValues = {
  title: string;
  visibility: "public" | "private";
  is_anonymous: boolean;
  content: string;
  answers: Record<number, string>;
};

type StoryFormProps = {
  mode: "freeform" | "questions";
  questions: Question[];
  initialValues?: Partial<StoryFormValues>;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: StoryFormValues) => void;
};

export default function StoryForm({
  mode,
  questions,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: StoryFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialValues?.visibility ?? "private"
  );
  const [isAnonymous, setIsAnonymous] = useState(initialValues?.is_anonymous ?? false);
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [answers, setAnswers] = useState<Record<number, string>>(
    initialValues?.answers ?? {}
  );
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, visibility, is_anonymous: isAnonymous, content, answers });
  };

  return (
    <Flex as="form" onSubmit={handleSubmit} direction="column" gap={6}>
      <Flex as="label" direction="column" gap={2}>
        <Text fontSize="sm" fontWeight="medium" color="fg.default">
          {t("storyForm.titleLabel")}
        </Text>
        <Input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          border="1px solid"
          borderColor="border.default"
          borderRadius="lg"
          px={4}
          py={3}
          h="auto"
          fontSize="md"
          color="fg.heading"
          _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
          placeholder={t("storyForm.titlePlaceholder")}
        />
      </Flex>

      <Fieldset.Root>
        <Fieldset.Legend fontSize="sm" fontWeight="medium" color="fg.default" mb={1}>
          {t("storyForm.visibilityLegend")}
        </Fieldset.Legend>
        <Flex gap={3}>
          <Button
            type="button"
            onClick={() => {
              setVisibility("private");
              setIsAnonymous(false);
            }}
            borderRadius="full"
            border="1px solid"
            fontSize="sm"
            fontWeight="medium"
            transition="colors 0.2s"
            bg={visibility === "private" ? "amber.800" : "transparent"}
            color={visibility === "private" ? "amber.50" : "stone.600"}
            borderColor={visibility === "private" ? "amber.800" : "amber.200"}
            _hover={{ bg: visibility === "private" ? "amber.800" : "amber.100" }}
          >
            {t("storyForm.visibilityPrivate")}
          </Button>
          <Button
            type="button"
            onClick={() => setVisibility("public")}
            borderRadius="full"
            border="1px solid"
            fontSize="sm"
            fontWeight="medium"
            transition="colors 0.2s"
            bg={visibility === "public" ? "amber.800" : "transparent"}
            color={visibility === "public" ? "amber.50" : "stone.600"}
            borderColor={visibility === "public" ? "amber.800" : "amber.200"}
            _hover={{ bg: visibility === "public" ? "amber.800" : "amber.100" }}
          >
            {t("storyForm.visibilityPublic")}
          </Button>
        </Flex>
      </Fieldset.Root>

      {visibility === "public" && (
        <Fieldset.Root>
          <Fieldset.Legend fontSize="sm" fontWeight="medium" color="fg.default" mb={1}>
            {t("storyForm.creditLegend")}
          </Fieldset.Legend>
          <Flex gap={3}>
            <Button
              type="button"
              onClick={() => setIsAnonymous(false)}
              borderRadius="full"
              border="1px solid"
              fontSize="sm"
              fontWeight="medium"
              transition="colors 0.2s"
              bg={!isAnonymous ? "amber.800" : "transparent"}
              color={!isAnonymous ? "amber.50" : "stone.600"}
              borderColor={!isAnonymous ? "amber.800" : "amber.200"}
              _hover={{ bg: !isAnonymous ? "amber.800" : "amber.100" }}
            >
              {t("storyForm.showName")}
            </Button>
            <Button
              type="button"
              onClick={() => setIsAnonymous(true)}
              borderRadius="full"
              border="1px solid"
              fontSize="sm"
              fontWeight="medium"
              transition="colors 0.2s"
              bg={isAnonymous ? "amber.800" : "transparent"}
              color={isAnonymous ? "amber.50" : "stone.600"}
              borderColor={isAnonymous ? "amber.800" : "amber.200"}
              _hover={{ bg: isAnonymous ? "amber.800" : "amber.100" }}
            >
              {t("storyForm.postAnonymously")}
            </Button>
          </Flex>
        </Fieldset.Root>
      )}

      {mode === "freeform" && (
        <Fieldset.Root>
          <Fieldset.Legend fontSize="sm" fontWeight="medium" color="fg.default" mb={1}>
            {t("storyForm.chronoLegend")}
          </Fieldset.Legend>
          <ReorderChronologically content={content} onReplace={setContent} />
        </Fieldset.Root>
      )}

      {mode === "freeform" ? (
        <Flex direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("storyForm.yourStoryLabel")}
          </Text>
          <VoiceTextarea
            required
            rows={14}
            value={content}
            onChange={setContent}
            placeholder={t("storyForm.yourStoryPlaceholder")}
          />
          <WritingAssist draft={content} onAppend={(text) => setContent((prev) => `${prev}\n\n${text}`)} />
        </Flex>
      ) : (
        <Flex direction="column" gap={6}>
          {questions.map((q) => (
            <Flex key={q.id} direction="column" gap={2}>
              <Text fontSize="sm" fontWeight="medium" color="fg.default">
                {q.prompt}
              </Text>
              <VoiceTextarea
                rows={4}
                value={answers[q.id] ?? ""}
                onChange={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                placeholder={t("storyForm.answerPlaceholder")}
              />
            </Flex>
          ))}
        </Flex>
      )}

      {error && (
        <Text color="red.600" fontSize="sm">
          {error}
        </Text>
      )}

      <Box>
        <Button
          type="submit"
          disabled={submitting}
          bg="amber.800"
          color="amber.50"
          borderRadius="full"
          fontWeight="medium"
          px={6}
          py={3}
          h="auto"
          _hover={{ bg: "amber.900" }}
          _disabled={{ opacity: 0.6 }}
        >
          {submitting ? t("storyForm.saving") : submitLabel}
        </Button>
      </Box>
    </Flex>
  );
}

function ReorderChronologically({
  content,
  onReplace,
}: {
  content: string;
  onReplace: (text: string) => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "unavailable" | "done">("idle");
  const { t } = useLanguage();

  const handleClick = async () => {
    setState("loading");
    try {
      const result = await api.post<{ content: string }>("/stories/reorder-content", { content });
      onReplace(result.content);
      setState("done");
    } catch (err) {
      setState(err instanceof ApiError && err.status === 503 ? "unavailable" : "error");
    }
  };

  return (
    <Flex direction="column" gap={2} align="flex-start">
      <Button
        type="button"
        onClick={handleClick}
        disabled={state === "loading" || !content.trim()}
        borderRadius="full"
        border="1px solid"
        borderColor="amber.200"
        fontSize="sm"
        fontWeight="medium"
        bg="transparent"
        color="stone.600"
        _hover={{ bg: "amber.100" }}
        _disabled={{ opacity: 0.6 }}
      >
        {state === "loading" ? t("storyForm.chronoLoading") : t("storyForm.chronoButton")}
      </Button>
      {state === "unavailable" && (
        <Text fontSize="xs" color="fg.subtle">
          {t("storyForm.chronoUnavailable")}
        </Text>
      )}
      {state === "error" && (
        <Text fontSize="xs" color="red.600">
          {t("storyForm.chronoError")}
        </Text>
      )}
      {state === "done" && (
        <Text fontSize="xs" color="green.700">
          {t("storyForm.chronoDone")}
        </Text>
      )}
    </Flex>
  );
}

function WritingAssist({ draft, onAppend }: { draft: string; onAppend: (text: string) => void }) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "unavailable">("idle");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleClick = async () => {
    setState("loading");
    setSuggestion(null);
    try {
      const result = await api.post<{ suggestion: string }>("/stories/assist", { draft });
      setSuggestion(result.suggestion);
      setState("idle");
    } catch (err) {
      setState(err instanceof ApiError && err.status === 503 ? "unavailable" : "error");
    }
  };

  return (
    <Flex direction="column" gap={2} align="flex-start">
      <Button
        type="button"
        onClick={handleClick}
        disabled={state === "loading" || !draft.trim()}
        variant="plain"
        h="auto"
        p={0}
        minW="auto"
        fontSize="sm"
        color="brand.text"
        fontWeight="medium"
        _hover={{ textDecoration: "underline" }}
        _disabled={{ opacity: 0.6 }}
      >
        {state === "loading" ? t("storyForm.assistLoading") : t("storyForm.assistButton")}
      </Button>
      {state === "unavailable" && (
        <Text fontSize="xs" color="fg.subtle">
          {t("storyForm.assistUnavailable")}
        </Text>
      )}
      {state === "error" && (
        <Text fontSize="xs" color="red.600">
          {t("storyForm.assistError")}
        </Text>
      )}
      {suggestion && (
        <Box bg="bg.subtle" border="1px solid" borderColor="border.default" borderRadius="lg" p={4} w="full">
          <Text fontSize="sm" color="fg.default" whiteSpace="pre-wrap" mb={3}>
            {suggestion}
          </Text>
          <Button
            type="button"
            onClick={() => {
              onAppend(suggestion);
              setSuggestion(null);
            }}
            bg="amber.800"
            color="amber.50"
            borderRadius="full"
            fontWeight="medium"
            fontSize="sm"
            px={4}
            py={2}
            h="auto"
            _hover={{ bg: "amber.900" }}
          >
            {t("storyForm.assistAccept")}
          </Button>
        </Box>
      )}
    </Flex>
  );
}
