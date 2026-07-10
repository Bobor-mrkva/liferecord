"use client";

import { useState } from "react";
import { Box, Button, Fieldset, Flex, Input, Text } from "@chakra-ui/react";
import { Question } from "@/lib/api";
import VoiceTextarea from "@/components/VoiceTextarea";

export type StoryFormValues = {
  title: string;
  visibility: "public" | "private";
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
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [answers, setAnswers] = useState<Record<number, string>>(
    initialValues?.answers ?? {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, visibility, content, answers });
  };

  return (
    <Flex as="form" onSubmit={handleSubmit} direction="column" gap={6}>
      <Flex as="label" direction="column" gap={2}>
        <Text fontSize="sm" fontWeight="medium" color="stone.700">
          Title
        </Text>
        <Input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          border="1px solid"
          borderColor="amber.200"
          borderRadius="lg"
          px={4}
          py={3}
          h="auto"
          fontSize="md"
          color="stone.900"
          _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
          placeholder="Give your story a title"
        />
      </Flex>

      <Fieldset.Root>
        <Fieldset.Legend fontSize="sm" fontWeight="medium" color="stone.700" mb={1}>
          Who can see this?
        </Fieldset.Legend>
        <Flex gap={3}>
          <Button
            type="button"
            onClick={() => setVisibility("private")}
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
            Private — only me
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
            Public — anyone
          </Button>
        </Flex>
      </Fieldset.Root>

      {mode === "freeform" ? (
        <Flex direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="stone.700">
            Your story
          </Text>
          <VoiceTextarea
            required
            rows={14}
            value={content}
            onChange={setContent}
            placeholder="Write your life story here, in your own words, or click the mic to speak it..."
          />
        </Flex>
      ) : (
        <Flex direction="column" gap={6}>
          {questions.map((q) => (
            <Flex key={q.id} direction="column" gap={2}>
              <Text fontSize="sm" fontWeight="medium" color="stone.700">
                {q.prompt}
              </Text>
              <VoiceTextarea
                rows={4}
                value={answers[q.id] ?? ""}
                onChange={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                placeholder="Answer in your own time, by typing or speaking — you can leave this blank"
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
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </Box>
    </Flex>
  );
}
