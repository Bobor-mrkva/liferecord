"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountMenu() {
  const { user, logout, refresh } = useAuth();
  const { t } = useLanguage();
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
          bg="bg.surface"
          border="1px solid"
          borderColor="border.default"
          borderRadius="xl"
          boxShadow="lg"
          py={4}
          px={5}
          zIndex={10}
          textAlign="left"
        >
          <Text fontWeight="semibold" color="fg.heading">
            {user.display_name}
          </Text>
          <Text fontSize="sm" color="fg.subtle" mb={3}>
            {user.email}
          </Text>
          <Flex
            direction="column"
            gap={1}
            fontSize="sm"
            color="fg.muted"
            borderTop="1px solid"
            borderColor="border.subtle"
            pt={3}
            mb={3}
          >
            <Text>
              {t(user.life_story_count === 1 ? "accountMenu.lifeStoriesOne" : "accountMenu.lifeStoriesOther", {
                count: user.life_story_count,
              })}
            </Text>
            <Text>
              {t(user.lesson_count === 1 ? "accountMenu.lessonsOne" : "accountMenu.lessonsOther", {
                count: user.lesson_count,
              })}
            </Text>
            <Text>
              {t(user.total_views === 1 ? "accountMenu.viewsOne" : "accountMenu.viewsOther", {
                count: user.total_views,
              })}
            </Text>
          </Flex>
          <Flex direction="column" gap={2} borderTop="1px solid" borderColor="border.subtle" pt={3}>
            <Link
              asChild
              fontSize="sm"
              color="brand.text"
              fontWeight="medium"
              _hover={{ textDecoration: "underline" }}
            >
              <NextLink href="/settings" onClick={() => setOpen(false)}>
                {t("accountMenu.settings")}
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
              {t("accountMenu.logout")}
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
