"use client";

import { useCallback } from "react";
import { Box, IconButton, Text, Textarea } from "@chakra-ui/react";
import { useSpeechToText } from "@/hooks/useSpeechToText";

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
          borderColor="amber.200"
          borderRadius="lg"
          px={4}
          py={3}
          pr={14}
          fontSize="md"
          color="stone.900"
          lineHeight="relaxed"
          _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
        />
        {isSupported && (
          <IconButton
            type="button"
            onClick={isListening ? stop : start}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            title={isListening ? "Stop voice input" : "Speak instead of typing"}
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
        <Text fontSize="xs" color="stone.400">
          Voice input isn&apos;t available in this browser — please type instead.
        </Text>
      )}
      {isListening && (
        <Text fontSize="xs" color="amber.700">
          Listening... speak your answer, then click the mic to stop.
        </Text>
      )}
    </Box>
  );
}
