"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { Button, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { api, ApiError, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t("auth.signup.passwordMismatch"));
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
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={2}>
        {t("auth.signup.title")}
      </Heading>
      <Text color="fg.subtle" mb={8}>
        {t("auth.signup.subtitle")}
      </Text>

      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={5}>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("auth.signup.nameLabel")}
          </Text>
          <Input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            border="1px solid"
            borderColor="border.default"
            borderRadius="lg"
            px={4}
            py={3}
            h="auto"
            fontSize="md"
            color="fg.heading"
            _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
            placeholder={t("auth.signup.namePlaceholder")}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("auth.emailLabel")}
          </Text>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            border="1px solid"
            borderColor="border.default"
            borderRadius="lg"
            px={4}
            py={3}
            h="auto"
            fontSize="md"
            color="fg.heading"
            _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
            placeholder={t("auth.emailPlaceholder")}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("auth.passwordLabel")}
          </Text>
          <PasswordInput
            value={password}
            onChange={setPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder={t("auth.signup.passwordPlaceholder")}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("auth.signup.confirmPasswordLabel")}
          </Text>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder={t("auth.signup.confirmPasswordPlaceholder")}
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
          {submitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
        </Button>
      </Flex>

      <Text fontSize="sm" color="fg.subtle" mt={6} textAlign="center">
        {t("auth.signup.haveAccount")}{" "}
        <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/login">{t("auth.signup.logIn")}</NextLink>
        </Link>
      </Text>
    </AuthCard>
  );
}
