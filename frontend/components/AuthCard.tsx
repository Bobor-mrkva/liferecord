import { Box, Flex } from "@chakra-ui/react";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="amber.50" minH="100vh">
      <Box w="full" maxW="md" bg="white" border="1px solid" borderColor="amber.200" borderRadius="2xl" p={8} boxShadow="sm">
        {children}
      </Box>
    </Flex>
  );
}
