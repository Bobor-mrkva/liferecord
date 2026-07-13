import { Box, Flex } from "@chakra-ui/react";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Box w="full" maxW="md" bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={8} boxShadow="sm">
        {children}
      </Box>
    </Flex>
  );
}
