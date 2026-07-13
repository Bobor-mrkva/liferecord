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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<User>("/auth/login", { email, password });
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
        {t("auth.login.title")}
      </Heading>
      <Text color="fg.subtle" mb={8}>
        {t("auth.login.subtitle")}
      </Text>

      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={5}>
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
            autoComplete="current-password"
            placeholder={t("auth.login.passwordPlaceholder")}
          />
          <Link asChild fontSize="sm" color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }} alignSelf="flex-start">
            <NextLink href="/forgot-password">{t("auth.login.forgotPassword")}</NextLink>
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
          {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </Flex>

      <Text fontSize="sm" color="fg.subtle" mt={6} textAlign="center">
        {t("auth.login.noAccount")}{" "}
        <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/signup">{t("auth.login.signUp")}</NextLink>
        </Link>
      </Text>
    </AuthCard>
  );
}
