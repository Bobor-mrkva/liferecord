"use client";

import { useEffect, useState } from "react";
import { Box, Button, Flex, Input, Text, Textarea } from "@chakra-ui/react";
import { TreeBubble } from "@/lib/api";
import ConfirmDialog from "./ConfirmDialog";

export type BubbleEditValues = {
  name: string;
  birth_year: number | null;
  location: string;
  notes: string;
};

type BubbleEditPanelProps = {
  bubble: TreeBubble;
  onClose: () => void;
  onSave: (id: number, values: BubbleEditValues) => void;
  onDelete: (id: number) => void;
  saving?: boolean;
};

const fieldStyle = {
  border: "1px solid",
  borderColor: "amber.200",
  borderRadius: "lg" as const,
  px: 4,
  py: 3,
  color: "stone.900",
  _focus: { outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" },
};

export default function BubbleEditPanel({ bubble, onClose, onSave, onDelete, saving }: BubbleEditPanelProps) {
  const [name, setName] = useState(bubble.name);
  const [birthYear, setBirthYear] = useState(bubble.birth_year?.toString() ?? "");
  const [location, setLocation] = useState(bubble.location ?? "");
  const [notes, setNotes] = useState(bubble.notes ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setName(bubble.name);
    setBirthYear(bubble.birth_year?.toString() ?? "");
    setLocation(bubble.location ?? "");
    setNotes(bubble.notes ?? "");
  }, [bubble]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(bubble.id, {
      name: name.trim(),
      birth_year: birthYear.trim() ? Number(birthYear) : null,
      location,
      notes,
    });
  };

  const handleDelete = () => {
    onDelete(bubble.id);
    setConfirmingDelete(false);
  };

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      h="100vh"
      w={{ base: "full", sm: "360px" }}
      bg="bg.surface"
      borderLeft="1px solid"
      borderColor="border.default"
      p={6}
      overflowY="auto"
      boxShadow="lg"
      zIndex={10}
    >
      <Flex align="center" justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="semibold" color="fg.heading">
          Edit relative
        </Text>
        <Button variant="plain" onClick={onClose} color="fg.subtle" h="auto" px={0} _hover={{ color: "stone.700" }}>
          Close
        </Button>
      </Flex>

      <Flex direction="column" gap={4}>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            Name
          </Text>
          <Input value={name} onChange={(e) => setName(e.target.value)} h="auto" {...fieldStyle} />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            Birth year (optional)
          </Text>
          <Input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            h="auto"
            {...fieldStyle}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            Location (optional)
          </Text>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} h="auto" {...fieldStyle} />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            Notes (optional)
          </Text>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} {...fieldStyle} />
        </Flex>

        <Button
          onClick={handleSave}
          disabled={saving || !name.trim()}
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
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={() => setConfirmingDelete(true)}
          variant="plain"
          color="red.600"
          fontWeight="medium"
          h="auto"
          px={0}
          justifyContent="flex-start"
          _hover={{ textDecoration: "underline" }}
        >
          Remove this relative
        </Button>
      </Flex>

      {confirmingDelete && (
        <ConfirmDialog
          title="Remove this relative?"
          message={`Remove ${bubble.name}? This will also remove any connections to other bubbles. This can't be undone.`}
          confirmLabel="Remove"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </Box>
  );
}
