"use client";

import { useCallback, useState } from "react";
import { Box, Button, IconButton, Text, Textarea } from "@chakra-ui/react";
import { api, ApiError } from "@/lib/api";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useLanguage } from "@/context/LanguageContext";

type VoiceTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

export default function VoiceTextarea({
  value,
  onChange,
  rows = 6,
  placeholder,
  required,
}: VoiceTextareaProps) {
  const handleResult = useCallback(
    (text: string) => {
      onChange(value ? `${value.trim()} ${text}` : text);
    },
    [value, onChange]
  );

  const { isSupported, isListening, start, stop } = useSpeechToText(handleResult);
  const { t } = useLanguage();

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box position="relative">
        <Textarea
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          w="full"
          border="1px solid"
          borderColor="border.default"
          borderRadius="lg"
          px={4}
          py={3}
          pr={14}
          fontSize="md"
          color="fg.heading"
          lineHeight="relaxed"
          _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
        />
        {isSupported && (
          <IconButton
            type="button"
            onClick={isListening ? stop : start}
            aria-label={isListening ? t("voiceTextarea.stopVoiceInput") : t("voiceTextarea.startVoiceInput")}
            title={isListening ? t("voiceTextarea.stopVoiceInput") : t("voiceTextarea.speakInstead")}
            position="absolute"
            top={3}
            right={3}
            w={9}
            h={9}
            borderRadius="full"
            bg={isListening ? "red.600" : "amber.100"}
            color={isListening ? "white" : "amber.800"}
            _hover={{ bg: isListening ? "red.600" : "amber.200" }}
            animation={isListening ? "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" : undefined}
          >
            🎤
          </IconButton>
        )}
      </Box>
      {!isSupported && (
        <Text fontSize="xs" color="fg.faint">
          {t("voiceTextarea.notSupported")}
        </Text>
      )}
      {isListening && (
        <Text fontSize="xs" color="brand.text">
          {t("voiceTextarea.listening")}
        </Text>
      )}
      <CleanupWithAI value={value} onReplace={onChange} />
    </Box>
  );
}

function CleanupWithAI({ value, onReplace }: { value: string; onReplace: (value: string) => void }) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "unavailable">("idle");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { t } = useLanguage();

  if (!value.trim()) return null;

  const handleClick = async () => {
    setState("loading");
    setSuggestion(null);
    try {
      const result = await api.post<{ text: string }>("/stories/cleanup-voice", { text: value });
      setSuggestion(result.text);
      setState("idle");
    } catch (err) {
      setState(err instanceof ApiError && err.status === 503 ? "unavailable" : "error");
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
      <Button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        variant="plain"
        h="auto"
        p={0}
        minW="auto"
        fontSize="xs"
        color="brand.text"
        fontWeight="medium"
        _hover={{ textDecoration: "underline" }}
        _disabled={{ opacity: 0.6 }}
      >
        {state === "loading" ? t("voiceTextarea.cleanupLoading") : t("voiceTextarea.cleanupButton")}
      </Button>
      {state === "unavailable" && (
        <Text fontSize="xs" color="fg.subtle">
          {t("voiceTextarea.cleanupUnavailable")}
        </Text>
      )}
      {state === "error" && (
        <Text fontSize="xs" color="red.600">
          {t("voiceTextarea.cleanupError")}
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
              onReplace(suggestion);
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
            {t("voiceTextarea.cleanupAccept")}
          </Button>
        </Box>
      )}
    </Box>
  );
}
