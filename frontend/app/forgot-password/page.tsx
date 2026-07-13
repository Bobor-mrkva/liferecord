"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Button, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { api, ApiError } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import AuthCard from "@/components/AuthCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={2}>
        {t("auth.forgotPassword.title")}
      </Heading>
      <Text color="fg.subtle" mb={8}>
        {t("auth.forgotPassword.subtitle")}
      </Text>

      {sent ? (
        <Text color="fg.default">{t("auth.forgotPassword.sent")}</Text>
      ) : (
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
            {submitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
          </Button>
        </Flex>
      )}

      <Text fontSize="sm" color="fg.subtle" mt={6} textAlign="center">
        <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/login">{t("auth.forgotPassword.backToLogin")}</NextLink>
        </Link>
      </Text>
    </AuthCard>
  );
}
