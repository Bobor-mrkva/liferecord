"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Fieldset, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, API_URL, FamilyTree, TreeBubble, TreeConnection, TreeMatches } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import FamilyTreeCanvas from "@/components/family-tree/FamilyTreeCanvas";
import BubbleEditPanel, { type BubbleEditValues } from "@/components/family-tree/BubbleEditPanel";
import PossibleMatches from "@/components/family-tree/PossibleMatches";

export default function FamilyTreePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<TreeBubble | null>(null);
  const [saving, setSaving] = useState(false);
  const [matches, setMatches] = useState<TreeMatches | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) api.get<FamilyTree>("/family-tree/mine").then(setTree);
  }, [user]);

  const loadMatches = useCallback(() => {
    setMatchesLoading(true);
    api
      .get<TreeMatches>("/family-tree/mine/matches")
      .then(setMatches)
      .finally(() => setMatchesLoading(false));
  }, []);

  useEffect(() => {
    if (tree?.visibility === "public") {
      loadMatches();
    } else {
      setMatches({ eligible: false, matches: [] });
    }
  }, [tree?.visibility, loadMatches]);

  if (authLoading || !user) return null;

  const handleAddBubble = async () => {
    const bubble = await api.post<TreeBubble>("/family-tree/mine/bubbles", {
      name: "New relative",
      position_x: Math.round(Math.random() * 400),
      position_y: Math.round(Math.random() * 300),
    });
    setTree((prev) => (prev ? { ...prev, bubbles: [...prev.bubbles, bubble] } : prev));
    setSelectedBubble(bubble);
  };

  const handleToggleVisibility = async (visibility: "public" | "private") => {
    const updated = await api.patch<FamilyTree>("/family-tree/mine", { visibility });
    setTree((prev) => (prev ? { ...prev, visibility: updated.visibility } : prev));
  };

  const handleBubbleDragStop = async (id: number, x: number, y: number) => {
    const updated = await api.patch<TreeBubble>(`/family-tree/bubbles/${id}`, {
      position_x: x,
      position_y: y,
    });
    setTree((prev) =>
      prev ? { ...prev, bubbles: prev.bubbles.map((b) => (b.id === id ? updated : b)) } : prev
    );
  };

  const handleBubbleSave = async (id: number, values: BubbleEditValues) => {
    setSaving(true);
    try {
      const updated = await api.patch<TreeBubble>(`/family-tree/bubbles/${id}`, values);
      setTree((prev) =>
        prev ? { ...prev, bubbles: prev.bubbles.map((b) => (b.id === id ? updated : b)) } : prev
      );
      setSelectedBubble(null);
    } finally {
      setSaving(false);
    }
  };

  const handleBubbleDelete = async (id: number) => {
    await api.delete(`/family-tree/bubbles/${id}`);
    setTree((prev) =>
      prev
        ? {
            ...prev,
            bubbles: prev.bubbles.filter((b) => b.id !== id),
            connections: prev.connections.filter((c) => c.from_bubble_id !== id && c.to_bubble_id !== id),
          }
        : prev
    );
    setSelectedBubble(null);
  };

  const handleConnectionCreate = async (
    fromId: number,
    toId: number,
    label: string,
    fromHandle: string | null,
    toHandle: string | null
  ) => {
    const connection = await api.post<TreeConnection>("/family-tree/mine/connections", {
      from_bubble_id: fromId,
      to_bubble_id: toId,
      label,
      from_handle: fromHandle,
      to_handle: toHandle,
    });
    setTree((prev) => (prev ? { ...prev, connections: [...prev.connections, connection] } : prev));
  };

  return (
    <Flex as="main" direction="column" bg="bg.page" minH="100vh">
      <Box px={{ base: 4, md: 8 }} pt={8} pb={4}>
        <Flex align="center" justify="space-between" mb={4} wrap="wrap" gap={4}>
          <Box>
            <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={1}>
              Family tree
            </Heading>
            <Text color="fg.subtle">Add relatives as bubbles, then connect them however fits your family.</Text>
          </Box>
          <Flex gap={3} align="center">
            {tree && tree.bubbles.length > 0 && (
              <Link
                href={`${API_URL}/family-tree/mine/export`}
                fontSize="sm"
                color="brand.text"
                fontWeight="medium"
                whiteSpace="nowrap"
                _hover={{ textDecoration: "underline" }}
              >
                Export as PDF
              </Link>
            )}
            <Button
              onClick={handleAddBubble}
              bg="amber.800"
              color="amber.50"
              borderRadius="full"
              fontWeight="medium"
              px={5}
              py={3}
              h="auto"
              whiteSpace="nowrap"
              _hover={{ bg: "amber.900" }}
            >
              + Add relative
            </Button>
          </Flex>
        </Flex>

        {tree && (
          <Fieldset.Root>
            <Fieldset.Legend fontSize="sm" fontWeight="medium" color="fg.default" mb={1}>
              Who can see this?
            </Fieldset.Legend>
            <Flex gap={3}>
              <Button
                type="button"
                onClick={() => handleToggleVisibility("private")}
                borderRadius="full"
                border="1px solid"
                fontSize="sm"
                fontWeight="medium"
                transition="colors 0.2s"
                bg={tree.visibility === "private" ? "amber.800" : "transparent"}
                color={tree.visibility === "private" ? "amber.50" : "stone.600"}
                borderColor={tree.visibility === "private" ? "amber.800" : "amber.200"}
                _hover={{ bg: tree.visibility === "private" ? "amber.800" : "amber.100" }}
              >
                Private — only me
              </Button>
              <Button
                type="button"
                onClick={() => handleToggleVisibility("public")}
                borderRadius="full"
                border="1px solid"
                fontSize="sm"
                fontWeight="medium"
                transition="colors 0.2s"
                bg={tree.visibility === "public" ? "amber.800" : "transparent"}
                color={tree.visibility === "public" ? "amber.50" : "stone.600"}
                borderColor={tree.visibility === "public" ? "amber.800" : "amber.200"}
                _hover={{ bg: tree.visibility === "public" ? "amber.800" : "amber.100" }}
              >
                Public — anyone
              </Button>
            </Flex>
          </Fieldset.Root>
        )}
      </Box>

      <Box px={{ base: 4, md: 8 }} pb={8}>
        {!tree ? (
          <Text color="fg.subtle">Loading...</Text>
        ) : (
          <Flex direction={{ base: "column", lg: "row" }} gap={6}>
            <Box flex="1" minW={0}>
              <FamilyTreeCanvas
                bubbles={tree.bubbles}
                connections={tree.connections}
                editable
                onBubbleDragStop={handleBubbleDragStop}
                onBubbleClick={setSelectedBubble}
                onConnectionCreate={handleConnectionCreate}
              />
            </Box>
            <Box w={{ base: "full", lg: "320px" }} flexShrink={0}>
              <PossibleMatches
                loading={matchesLoading}
                eligible={matches?.eligible ?? false}
                matches={matches?.matches ?? []}
              />
            </Box>
          </Flex>
        )}
      </Box>

      {selectedBubble && (
        <BubbleEditPanel
          bubble={selectedBubble}
          onClose={() => setSelectedBubble(null)}
          onSave={handleBubbleSave}
          onDelete={handleBubbleDelete}
          saving={saving}
        />
      )}
    </Flex>
  );
}
