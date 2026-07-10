"use client";

import NextLink from "next/link";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import AccountMenu from "@/components/AccountMenu";

export default function NavBar() {
  const { user, loading } = useAuth();

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      px={8}
      py={5}
      bg="amber.100"
      borderBottom="1px solid"
      borderColor="amber.300"
    >
      <Link asChild fontSize="2xl" fontWeight="semibold" letterSpacing="tight" color="amber.900">
        <NextLink href="/">Liferecord</NextLink>
      </Link>
      <Flex gap={4} fontSize="sm" align="center">
        <Link asChild color="stone.600" _hover={{ color: "amber.900" }} transition="color 0.2s">
          <NextLink href="/stories">Read stories</NextLink>
        </Link>
        {loading ? null : user ? (
          <>
            <Link asChild color="stone.600" _hover={{ color: "amber.900" }} transition="color 0.2s">
              <NextLink href="/dashboard">My stories</NextLink>
            </Link>
            <AccountMenu />
          </>
        ) : (
          <>
            <Link asChild color="stone.600" _hover={{ color: "amber.900" }} transition="color 0.2s">
              <NextLink href="/login">Log in</NextLink>
            </Link>
            <Button asChild bg="amber.800" color="amber.50" borderRadius="full" _hover={{ bg: "amber.900" }}>
              <NextLink href="/signup">
                <Box as="span">Start sharing</Box>
              </NextLink>
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
}
