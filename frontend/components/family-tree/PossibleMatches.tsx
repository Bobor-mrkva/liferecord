"use client";

import NextLink from "next/link";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { TreeMatch } from "@/lib/api";

type PossibleMatchesProps = {
  loading: boolean;
  eligible: boolean;
  matches: TreeMatch[];
};

export default function PossibleMatches({ loading, eligible, matches }: PossibleMatchesProps) {
  return (
    <Box bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={6}>
      <Text fontSize="lg" fontWeight="semibold" color="fg.heading" mb={3}>
        Possible relatives
      </Text>

      {loading ? (
        <Text color="fg.subtle" fontSize="sm">
          Loading...
        </Text>
      ) : !eligible ? (
        <Text color="fg.subtle" fontSize="sm">
          Make your family tree public to see possible relatives from other public trees.
        </Text>
      ) : matches.length === 0 ? (
        <Text color="fg.subtle" fontSize="sm">
          No possible relatives found yet.
        </Text>
      ) : (
        <Flex direction="column" gap={3}>
          {matches.map((match) => {
            const details = [match.birth_year, match.location].filter(Boolean).join(", ");
            return (
              <Link
                key={`${match.tree_id}-${match.bubble_id}`}
                asChild
                display="block"
                border="1px solid"
                borderColor="border.default"
                borderRadius="xl"
                p={3}
                _hover={{ borderColor: "amber.400" }}
                transition="border-color 0.2s"
              >
                <NextLink href={`/family-tree/${match.tree_id}`}>
                  <Text fontWeight="semibold" color="fg.heading" fontSize="sm">
                    {match.name}
                  </Text>
                  <Text color="fg.subtle" fontSize="xs">
                    in {match.tree_owner_display_name}&apos;s family tree
                    {details ? ` · ${details}` : ""}
                  </Text>
                </NextLink>
              </Link>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
