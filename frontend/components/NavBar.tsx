"use client";

import NextLink from "next/link";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AccountMenu from "@/components/AccountMenu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ModeSwitcher from "@/components/ModeSwitcher";

export default function NavBar() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      px={{ base: 4, md: 8 }}
      py={5}
      bg="bg.subtle"
      borderBottom="1px solid"
      borderColor="border.strong"
    >
      <Flex align="center" gap={3}>
        <Link asChild fontSize="2xl" fontWeight="semibold" letterSpacing="tight" color="brand.heading" whiteSpace="nowrap">
          <NextLink href="/">Liferecord</NextLink>
        </Link>
        <LanguageSwitcher />
        <ModeSwitcher />
      </Flex>
      <Flex gap={{ base: 2, md: 4 }} rowGap={2} fontSize="sm" align="center" justify="flex-end" flexWrap="wrap">
        {!loading && user && (
          <Link
            asChild
            display={{ base: "none", sm: "inline" }}
            color="fg.muted"
            _hover={{ color: "brand.hover" }}
            transition="color 0.2s"
            whiteSpace="nowrap"
          >
            <NextLink href="/family-tree">{t("nav.familyTree")}</NextLink>
          </Link>
        )}
        <Link
          asChild
          display={{ base: "none", sm: "inline" }}
          color="fg.muted"
          _hover={{ color: "brand.hover" }}
          transition="color 0.2s"
          whiteSpace="nowrap"
        >
          <NextLink href="/stories">{t("nav.readStories")}</NextLink>
        </Link>
        {loading ? null : user ? (
          <>
            <Link asChild color="fg.muted" _hover={{ color: "brand.hover" }} transition="color 0.2s" whiteSpace="nowrap">
              <NextLink href="/dashboard">{t("nav.myStories")}</NextLink>
            </Link>
            <AccountMenu />
          </>
        ) : (
          <>
            <Link asChild color="fg.muted" _hover={{ color: "brand.hover" }} transition="color 0.2s" whiteSpace="nowrap">
              <NextLink href="/login">{t("nav.login")}</NextLink>
            </Link>
            <Button asChild bg="amber.800" color="amber.50" borderRadius="full" whiteSpace="nowrap" _hover={{ bg: "amber.900" }}>
              <NextLink href="/signup">
                <Box as="span">{t("nav.startSharing")}</Box>
              </NextLink>
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
}
