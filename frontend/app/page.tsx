"use client";

import NextLink from "next/link";
import { Box, Flex, Grid, Heading, Link, Text } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const writeHref = user ? "/stories/new" : "/signup";

  return (
    <Flex
      as="main"
      direction="column"
      minH="100vh"
      bg="bg.page"
      color="fg.default"
      fontFamily="var(--font-geist-sans)"
    >
      {/* Hero */}
      <Flex
        as="section"
        direction="column"
        align="center"
        textAlign="center"
        px={6}
        py={24}
        gap={6}
        maxW="3xl"
        mx="auto"
      >
        <Text fontSize="sm" fontWeight="medium" letterSpacing="widest" textTransform="uppercase" color="brand.text">
          {t("home.eyebrow")}
        </Text>
        <Heading as="h1" fontSize="5xl" fontWeight="bold" lineHeight="shorter" color="fg.heading">
          {t("home.heroTitleLine1")}
          <br />
          {t("home.heroTitleLine2")}
        </Heading>
        <Text fontSize="lg" color="fg.muted" maxW="xl" lineHeight="relaxed">
          {t("home.heroSubtitle")}
        </Text>
        <Flex direction={{ base: "column", sm: "row" }} gap={3} mt={4}>
          <Link
            asChild
            bg="amber.800"
            color="amber.50"
            px={7}
            py={3}
            borderRadius="full"
            fontSize="md"
            fontWeight="medium"
            _hover={{ bg: "amber.900" }}
            transition="background-color 0.2s"
          >
            <NextLink href={writeHref}>{t("home.writeYourStory")}</NextLink>
          </Link>
          <Link
            asChild
            border="1px solid"
            borderColor="brand.text"
            color="brand.text"
            px={7}
            py={3}
            borderRadius="full"
            fontSize="md"
            fontWeight="medium"
            _hover={{ bg: "amber.100" }}
            transition="background-color 0.2s"
          >
            <NextLink href="/stories">{t("home.readStories")}</NextLink>
          </Link>
        </Flex>
      </Flex>

      {/* Feature strip */}
      <Box as="section" bg="bg.surface" borderY="1px solid" borderColor="border.default" py={16} px={6}>
        <Grid
          maxW="4xl"
          mx="auto"
          templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }}
          gap={10}
          textAlign="center"
        >
          {[
            {
              icon: "✍️",
              title: t("home.feature1Title"),
              desc: t("home.feature1Desc"),
            },
            {
              icon: "📖",
              title: t("home.feature2Title"),
              desc: t("home.feature2Desc"),
            },
            {
              icon: "🌿",
              title: t("home.feature3Title"),
              desc: t("home.feature3Desc"),
            },
          ].map((f) => (
            <Flex key={f.title} direction="column" align="center" gap={3}>
              <Text fontSize="4xl">{f.icon}</Text>
              <Heading as="h3" fontWeight="semibold" fontSize="lg" color="fg.heading">
                {f.title}
              </Heading>
              <Text color="fg.subtle" fontSize="sm" lineHeight="relaxed">
                {f.desc}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Box>

      {/* How it works */}
      <Box as="section" id="how-it-works" py={20} px={6} maxW="3xl" mx="auto" w="full">
        <Heading as="h2" fontSize="3xl" fontWeight="bold" textAlign="center" mb={12} color="fg.heading">
          {t("home.howItWorks")}
        </Heading>
        <Flex as="ol" direction="column" gap={8}>
          {[
            { step: "1", title: t("home.step1Title"), desc: t("home.step1Desc") },
            { step: "2", title: t("home.step2Title"), desc: t("home.step2Desc") },
            { step: "3", title: t("home.step3Title"), desc: t("home.step3Desc") },
          ].map((s) => (
            <Flex as="li" key={s.step} gap={5} align="flex-start">
              <Flex
                flexShrink={0}
                w={10}
                h={10}
                borderRadius="full"
                bg="amber.800"
                color="amber.50"
                align="center"
                justify="center"
                fontWeight="bold"
                fontSize="lg"
              >
                {s.step}
              </Flex>
              <Box>
                <Heading as="h3" fontWeight="semibold" fontSize="md" color="fg.heading">
                  {s.title}
                </Heading>
                <Text color="fg.subtle" fontSize="sm" mt={1}>
                  {s.desc}
                </Text>
              </Box>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* CTA banner */}
      <Box as="section" bg="amber.800" color="amber.50" py={16} px={6} textAlign="center">
        <Heading as="h2" fontSize="3xl" fontWeight="bold" mb={3}>
          {t("home.ctaTitle")}
        </Heading>
        <Text color="amber.200" mb={8} maxW="md" mx="auto">
          {t("home.ctaSubtitle")}
        </Text>
        <Link
          asChild
          bg="bg.page"
          color="amber.900"
          px={8}
          py={3}
          borderRadius="full"
          fontWeight="medium"
          _hover={{ bg: "white" }}
          transition="background-color 0.2s"
        >
          <NextLink href={writeHref}>{t("home.ctaButton")}</NextLink>
        </Link>
      </Box>

      {/* Footer */}
      <Box as="footer" py={6} px={8} textAlign="center" color="fg.faint" fontSize="sm" borderTop="1px solid" borderColor="border.default">
        {t("home.footer", { year: new Date().getFullYear() })}
      </Box>
    </Flex>
  );
}
