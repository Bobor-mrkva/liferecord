"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Button, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { api, ApiError } from "@/lib/api";
import AuthCard from "@/components/AuthCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={2}>
        Reset your password
      </Heading>
      <Text color="stone.500" mb={8}>
        Enter your email and we&apos;ll send you a link to choose a new password.
      </Text>

      {sent ? (
        <Text color="stone.700">
          If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
        </Text>
      ) : (
        <Flex as="form" onSubmit={handleSubmit} direction="column" gap={5}>
          <Flex as="label" direction="column" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="stone.700">
              Email
            </Text>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              border="1px solid"
              borderColor="amber.200"
              borderRadius="lg"
              px={4}
              py={3}
              h="auto"
              fontSize="md"
              color="stone.900"
              _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
              placeholder="you@example.com"
            />
          </Flex>

          {error && (
            <Text color="red.600" fontSize="sm">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            disabled={submitting}
            bg="amber.800"
            color="amber.50"
            borderRadius="full"
            fontWeight="medium"
            px={6}
            py={3}
            h="auto"
            _hover={{ bg: "amber.900" }}
            _disabled={{ opacity: 0.6 }}
          >
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </Flex>
      )}

      <Text fontSize="sm" color="stone.500" mt={6} textAlign="center">
        <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/login">Back to login</NextLink>
        </Link>
      </Text>
    </AuthCard>
  );
}
