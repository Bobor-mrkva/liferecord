"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Button, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { api, ApiError, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";
import AuthCard from "@/components/AuthCard";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match — please check both fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post<User>("/auth/signup", {
        email,
        password,
        display_name: displayName,
      });
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
        Create your account
      </Heading>
      <Text color="stone.500" mb={8}>
        Start writing your story today. It only takes a minute.
      </Text>

      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={5}>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="stone.700">
            Your name
          </Text>
          <Input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            border="1px solid"
            borderColor="amber.200"
            borderRadius="lg"
            px={4}
            py={3}
            h="auto"
            fontSize="md"
            color="stone.900"
            _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
            placeholder="Jane Doe"
          />
        </Flex>
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
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="stone.700">
            Confirm password
          </Text>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder="Type your password again"
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
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </Flex>

      <Text fontSize="sm" color="stone.500" mt={6} textAlign="center">
        Already have an account?{" "}
        <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/login">Log in</NextLink>
        </Link>
      </Text>
    </AuthCard>
  );
}
