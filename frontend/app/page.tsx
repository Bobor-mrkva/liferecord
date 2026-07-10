"use client";

import NextLink from "next/link";
import { Box, Flex, Grid, Heading, Link, Text } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const writeHref = user ? "/stories/new" : "/signup";

  return (
    <Flex
      as="main"
      direction="column"
      minH="100vh"
      bg="amber.50"
      color="stone.800"
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
        <Text fontSize="sm" fontWeight="medium" letterSpacing="widest" textTransform="uppercase" color="amber.700">
          Every life is a story worth telling
        </Text>
        <Heading as="h1" fontSize="5xl" fontWeight="bold" lineHeight="tight" color="stone.900">
          Your memories deserve
          <br />
          to live on
        </Heading>
        <Text fontSize="lg" color="stone.600" maxW="xl" lineHeight="relaxed">
          Liferecord is a warm, simple place where elders can write and share their life
          stories — for family, for the world, and for generations to come.
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
            <NextLink href={writeHref}>Write your story</NextLink>
          </Link>
          <Link
            asChild
            border="1px solid"
            borderColor="amber.800"
            color="amber.800"
            px={7}
            py={3}
            borderRadius="full"
            fontSize="md"
            fontWeight="medium"
            _hover={{ bg: "amber.100" }}
            transition="background-color 0.2s"
          >
            <NextLink href="/stories">Read stories</NextLink>
          </Link>
        </Flex>
      </Flex>

      {/* Feature strip */}
      <Box as="section" bg="white" borderY="1px solid" borderColor="amber.200" py={16} px={6}>
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
              title: "Write simply",
              desc: "No complicated tools. Just a clean page where you can type your memories at your own pace.",
            },
            {
              icon: "📖",
              title: "Share with family",
              desc: "Send a link to loved ones so they can read, comment, and treasure your stories forever.",
            },
            {
              icon: "🌿",
              title: "Preserved forever",
              desc: "Your stories are safely stored and available to those you choose, now and in the future.",
            },
          ].map((f) => (
            <Flex key={f.title} direction="column" align="center" gap={3}>
              <Text fontSize="4xl">{f.icon}</Text>
              <Heading as="h3" fontWeight="semibold" fontSize="lg" color="stone.900">
                {f.title}
              </Heading>
              <Text color="stone.500" fontSize="sm" lineHeight="relaxed">
                {f.desc}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Box>

      {/* How it works */}
      <Box as="section" id="how-it-works" py={20} px={6} maxW="3xl" mx="auto" w="full">
        <Heading as="h2" fontSize="3xl" fontWeight="bold" textAlign="center" mb={12} color="stone.900">
          How it works
        </Heading>
        <Flex as="ol" direction="column" gap={8}>
          {[
            { step: "1", title: "Create an account", desc: "Sign up in seconds — no complicated setup needed." },
            { step: "2", title: "Write a memory", desc: "Use our gentle editor to write a story, big or small." },
            { step: "3", title: "Share it", desc: "Choose who can read it — family only, or the whole world." },
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
                <Heading as="h3" fontWeight="semibold" fontSize="md" color="stone.900">
                  {s.title}
                </Heading>
                <Text color="stone.500" fontSize="sm" mt={1}>
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
          Ready to begin?
        </Heading>
        <Text color="amber.200" mb={8} maxW="md" mx="auto">
          Join Liferecord today and start turning your memories into stories that last.
        </Text>
        <Link
          asChild
          bg="amber.50"
          color="amber.900"
          px={8}
          py={3}
          borderRadius="full"
          fontWeight="medium"
          _hover={{ bg: "white" }}
          transition="background-color 0.2s"
        >
          <NextLink href={writeHref}>Get started — it&apos;s free</NextLink>
        </Link>
      </Box>

      {/* Footer */}
      <Box as="footer" py={6} px={8} textAlign="center" color="stone.400" fontSize="sm" borderTop="1px solid" borderColor="amber.200">
        © {new Date().getFullYear()} Liferecord. Built with care.
      </Box>
    </Flex>
  );
}
