"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box } from "@chakra-ui/react";
import { TreeBubble, TreeConnection } from "@/lib/api";
import BubbleNode, { type BubbleNodeType } from "./BubbleNode";
import ConnectionLabelPrompt from "./ConnectionLabelPrompt";

const nodeTypes = { bubble: BubbleNode };

function bubblesToNodes(bubbles: TreeBubble[]): BubbleNodeType[] {
  return bubbles.map((b) => ({
    id: String(b.id),
    type: "bubble",
    position: { x: b.position_x, y: b.position_y },
    data: { bubble: b },
  }));
}

function connectionsToEdges(connections: TreeConnection[]): Edge[] {
  return connections.map((c) => ({
    id: String(c.id),
    source: String(c.from_bubble_id),
    target: String(c.to_bubble_id),
    sourceHandle: c.from_handle ?? undefined,
    targetHandle: c.to_handle ?? undefined,
    label: c.label,
  }));
}

type FamilyTreeCanvasProps = {
  bubbles: TreeBubble[];
  connections: TreeConnection[];
  editable: boolean;
  onBubbleDragStop?: (id: number, x: number, y: number) => void;
  onBubbleClick?: (bubble: TreeBubble) => void;
  onConnectionCreate?: (
    fromId: number,
    toId: number,
    label: string,
    fromHandle: string | null,
    toHandle: string | null
  ) => void;
};

function Canvas({
  bubbles,
  connections,
  editable,
  onBubbleDragStop,
  onBubbleClick,
  onConnectionCreate,
}: FamilyTreeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<BubbleNodeType>(bubblesToNodes(bubbles));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(connectionsToEdges(connections));
  const [pendingConnection, setPendingConnection] = useState<{
    source: string;
    target: string;
    sourceHandle: string | null;
    targetHandle: string | null;
  } | null>(null);

  useEffect(() => {
    setNodes(bubblesToNodes(bubbles));
  }, [bubbles, setNodes]);

  useEffect(() => {
    setEdges(connectionsToEdges(connections));
  }, [connections, setEdges]);

  const handleNodeDragStop: OnNodeDrag<BubbleNodeType> = (_event, node) => {
    onBubbleDragStop?.(Number(node.id), node.position.x, node.position.y);
  };

  const handleNodeClick: NodeMouseHandler<BubbleNodeType> = (_event, node) => {
    if (!editable) return;
    onBubbleClick?.(node.data.bubble);
  };

  const handleConnect = (connection: Connection) => {
    if (!editable || !connection.source || !connection.target) return;
    setPendingConnection({
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
    });
  };

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={editable ? handleNodeDragStop : undefined}
        onNodeClick={handleNodeClick}
        onConnect={editable ? handleConnect : undefined}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={editable}
        fitView
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
      {pendingConnection && (
        <ConnectionLabelPrompt
          onCancel={() => setPendingConnection(null)}
          onConfirm={(label) => {
            onConnectionCreate?.(
              Number(pendingConnection.source),
              Number(pendingConnection.target),
              label,
              pendingConnection.sourceHandle,
              pendingConnection.targetHandle
            );
            setPendingConnection(null);
          }}
        />
      )}
    </>
  );
}

export default function FamilyTreeCanvas(props: FamilyTreeCanvasProps) {
  return (
    <Box
      h="70vh"
      minH="500px"
      w="full"
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid"
      borderColor="border.default"
      bg="bg.surface"
    >
      <ReactFlowProvider>
        <Canvas {...props} />
      </ReactFlowProvider>
    </Box>
  );
}
