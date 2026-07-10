"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, ApiError } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";
import AuthCard from "@/components/AuthCard";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <Text color="red.600">This reset link is invalid or has expired.</Text>
        <Text fontSize="sm" color="stone.500" mt={6} textAlign="center">
          <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
            <NextLink href="/forgot-password">Request a new link</NextLink>
          </Link>
        </Text>
      </>
    );
  }

  return (
    <>
      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={5}>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="stone.700">
            New password
          </Text>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="stone.700">
            Confirm new password
          </Text>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
            placeholder="Re-enter your new password"
          />
        </Flex>

        {error && (
          <Text color="red.600" fontSize="sm">
            {error}
            {error.includes("invalid or has expired") && (
              <>
                {" "}
                <Link asChild fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                  <NextLink href="/forgot-password">Request a new link</NextLink>
                </Link>
              </>
            )}
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
          {submitting ? "Saving..." : "Set new password"}
        </Button>
      </Flex>

      <Text fontSize="sm" color="stone.500" mt={6} textAlign="center">
        <Link asChild color="amber.800" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/login">Back to login</NextLink>
        </Link>
      </Text>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <Heading as="h1" fontSize="3xl" fontWeight="bold" color="stone.900" mb={2}>
        Choose a new password
      </Heading>
      <Text color="stone.500" mb={8}>
        Enter a new password for your account.
      </Text>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
