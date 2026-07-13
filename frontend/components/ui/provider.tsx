"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/lib/theme";
import EmotionRegistry from "./EmotionRegistry";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </EmotionRegistry>
  );
}
