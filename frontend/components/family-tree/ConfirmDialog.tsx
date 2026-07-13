"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Flex position="fixed" inset={0} align="center" justify="center" bg="blackAlpha.400" zIndex={20} onClick={onCancel}>
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        bg="bg.surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="2xl"
        boxShadow="lg"
        p={6}
        w="full"
        maxW="380px"
      >
        <Text fontSize="lg" fontWeight="semibold" color="fg.heading" mb={2}>
          {title}
        </Text>
        <Text color="fg.subtle" fontSize="sm" mb={6}>
          {message}
        </Text>
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
            type="button"
            onClick={onConfirm}
            bg={danger ? "red.600" : "amber.800"}
            color={danger ? "white" : "amber.50"}
            borderRadius="full"
            fontWeight="medium"
            px={5}
            py={2}
            h="auto"
            _hover={{ bg: danger ? "red.700" : "amber.900" }}
          >
            {confirmLabel}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
