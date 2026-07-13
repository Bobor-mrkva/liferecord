"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { api, ApiError } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("auth.resetPassword.mismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <Text color="red.600">{t("auth.resetPassword.invalidLink")}</Text>
        <Text fontSize="sm" color="fg.subtle" mt={6} textAlign="center">
          <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
            <NextLink href="/forgot-password">{t("auth.resetPassword.requestNewLink")}</NextLink>
          </Link>
        </Text>
      </>
    );
  }

  return (
    <>
      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={5}>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("auth.resetPassword.newPasswordLabel")}
          </Text>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("auth.resetPassword.confirmNewPasswordLabel")}
          </Text>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
            placeholder={t("auth.resetPassword.confirmNewPasswordPlaceholder")}
          />
        </Flex>

        {error && (
          <Text color="red.600" fontSize="sm">
            {error}
            {error.includes("invalid or has expired") && (
              <>
                {" "}
                <Link asChild fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                  <NextLink href="/forgot-password">{t("auth.resetPassword.requestNewLink")}</NextLink>
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
          {submitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
        </Button>
      </Flex>

      <Text fontSize="sm" color="fg.subtle" mt={6} textAlign="center">
        <Link asChild color="brand.text" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
          <NextLink href="/login">{t("auth.resetPassword.backToLogin")}</NextLink>
        </Link>
      </Text>
    </>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <AuthCard>
      <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading" mb={2}>
        {t("auth.resetPassword.title")}
      </Heading>
      <Text color="fg.subtle" mb={8}>
        {t("auth.resetPassword.subtitle")}
      </Text>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
