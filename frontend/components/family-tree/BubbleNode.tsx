"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import { TreeBubble } from "@/lib/api";

export type BubbleNodeType = Node<{ bubble: TreeBubble }, "bubble">;

const handleStyle = {
  width: 10,
  height: 10,
  background: "#92400e",
  border: "2px solid white",
};

export default function BubbleNode({ data, selected }: NodeProps<BubbleNodeType>) {
  const { bubble } = data;
  const subtitle = [bubble.birth_year, bubble.location].filter(Boolean).join(" · ");

  return (
    <Box
      bg="bg.surface"
      border="1px solid"
      borderColor={selected ? "amber.400" : "amber.200"}
      borderRadius="2xl"
      px={4}
      py={3}
      minW="140px"
      maxW="200px"
      textAlign="center"
      boxShadow="sm"
      cursor="pointer"
      _hover={{ borderColor: "amber.400" }}
      transition="border-color 0.2s"
    >
      <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      <Text fontWeight="semibold" color="fg.heading" fontSize="sm">
        {bubble.name}
      </Text>
      {subtitle && (
        <Text color="fg.subtle" fontSize="xs" mt={0.5}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
