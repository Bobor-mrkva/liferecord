"use client";

import { useState } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";

type ConnectionLabelPromptProps = {
  onConfirm: (label: string) => void;
  onCancel: () => void;
};

export default function ConnectionLabelPrompt({ onConfirm, onCancel }: ConnectionLabelPromptProps) {
  const [label, setLabel] = useState("");

  const handleConfirm = () => {
    if (!label.trim()) return;
    onConfirm(label.trim());
  };

  return (
    <Flex
      position="fixed"
      inset={0}
      align="center"
      justify="center"
      bg="blackAlpha.400"
      zIndex={20}
      onClick={onCancel}
    >
      <Box
        as="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          handleConfirm();
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        bg="bg.surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="2xl"
        boxShadow="lg"
        p={6}
        w="full"
        maxW="360px"
      >
        <Text fontSize="lg" fontWeight="semibold" color="fg.heading" mb={1}>
          How are they related?
        </Text>
        <Text color="fg.subtle" fontSize="sm" mb={4}>
          e.g. parent, spouse, godmother — whatever fits your family.
        </Text>
        <Input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Relationship"
          border="1px solid"
          borderColor="border.default"
          borderRadius="lg"
          px={4}
          py={3}
          h="auto"
          color="fg.heading"
          mb={5}
          _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
        />
        <Flex gap={3} justify="flex-end">
          <Button
            type="button"
            onClick={onCancel}
            variant="plain"
            color="fg.muted"
            fontWeight="medium"
            h="auto"
            px={3}
            py={2}
            _hover={{ color: "stone.800" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!label.trim()}
            bg="amber.800"
            color="amber.50"
            borderRadius="full"
            fontWeight="medium"
            px={5}
            py={2}
            h="auto"
            _hover={{ bg: "amber.900" }}
            _disabled={{ opacity: 0.6 }}
          >
            Connect
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
