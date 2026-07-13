"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, ApiError, FamilyTree } from "@/lib/api";
import FamilyTreeCanvas from "@/components/family-tree/FamilyTreeCanvas";

export default function PublicFamilyTreePage() {
  const { id } = useParams<{ id: string }>();
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<FamilyTree>(`/family-tree/${id}`)
      .then(setTree)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id]);

  if (notFound) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="bg.page" minH="100vh" textAlign="center">
        <Text color="fg.muted">This family tree is private or doesn&apos;t exist.</Text>
        <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }} mt={4}>
          <NextLink href="/">Back home</NextLink>
        </Link>
      </Flex>
    );
  }

  if (!tree) {
    return (
      <Flex as="main" direction="column" align="center" px={6} py={24} bg="bg.page" minH="100vh">
        <Text color="fg.subtle">Loading...</Text>
      </Flex>
    );
  }

  return (
    <Flex as="main" direction="column" bg="bg.page" minH="100vh">
      <Box px={{ base: 4, md: 8 }} pt={8} pb={4}>
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={1}>
          {tree.owner_display_name}&apos;s family tree
        </Heading>
        <Text color="fg.subtle">Browsing only — you can pan and zoom, but not edit.</Text>
      </Box>
      <Box px={{ base: 4, md: 8 }} pb={8}>
        <FamilyTreeCanvas bubbles={tree.bubbles} connections={tree.connections} editable={false} />
      </Box>
    </Flex>
  );
}
