"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Button, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { api, ApiError, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<User>("/auth/login", { email, password });
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={2}>
        Welcome back
      </Heading>
      <Text color="stone.500" mb={8}>
        Log in to continue your story.
      </Text>

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
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="stone.700">
            Password
          </Text>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Your password"
          />
          <Link asChild fontSize="sm" color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }} alignSelf="flex-start">
            <NextLink href="/forgot-password">Forgot your password?</NextLink>
          </Link>
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
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </Flex>

      <Text fontSize="sm" color="stone.500" mt={6} textAlign="center">
        Don&apos;t have an account?{" "}
        <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/signup">Sign up</NextLink>
        </Link>
      </Text>
    </AuthCard>
  );
}
