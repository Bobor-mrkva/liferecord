"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

export default function AccountMenu() {
  const { user, logout, refresh } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const handleToggle = () => {
    if (!open) refresh();
    setOpen((v) => !v);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <Box position="relative" ref={menuRef}>
      <Button
        onClick={handleToggle}
        bg="amber.800"
        color="amber.50"
        borderRadius="full"
        _hover={{ bg: "amber.900" }}
      >
        {user.display_name}
      </Button>

      {open && (
        <Box
          position="absolute"
          right={0}
          mt={2}
          w="64"
          bg="white"
          border="1px solid"
          borderColor="amber.200"
          borderRadius="xl"
          boxShadow="lg"
          py={4}
          px={5}
          zIndex={10}
          textAlign="left"
        >
          <Text fontWeight="semibold" color="stone.900">
            {user.display_name}
          </Text>
          <Text fontSize="sm" color="stone.500" mb={3}>
            {user.email}
          </Text>
          <Flex
            direction="column"
            gap={1}
            fontSize="sm"
            color="stone.600"
            borderTop="1px solid"
            borderColor="amber.100"
            pt={3}
            mb={3}
          >
            <Text>
              {user.story_count} {user.story_count === 1 ? "story" : "stories"} written
            </Text>
            <Text>
              {user.total_views} {user.total_views === 1 ? "person has" : "people have"} read your
              stories
            </Text>
          </Flex>
          <Flex direction="column" gap={2} borderTop="1px solid" borderColor="amber.100" pt={3}>
            <Link
              asChild
              fontSize="sm"
              color="amber.800"
              fontWeight="medium"
              _hover={{ textDecoration: "underline" }}
            >
              <NextLink href="/settings" onClick={() => setOpen(false)}>
                Settings
              </NextLink>
            </Link>
            <Button
              onClick={handleLogout}
              variant="plain"
              fontSize="sm"
              color="red.600"
              fontWeight="medium"
              justifyContent="flex-start"
              px={0}
              h="auto"
              _hover={{ textDecoration: "underline" }}
            >
              Log out
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
