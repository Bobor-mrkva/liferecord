"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { api, ApiError, formatDuration, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import PasswordInput from "@/components/PasswordInput";

function useCountdown(initialMs: number) {
  const [remaining, setRemaining] = useState(initialMs);
  const [prevInitialMs, setPrevInitialMs] = useState(initialMs);

  if (initialMs !== prevInitialMs) {
    setPrevInitialMs(initialMs);
    setRemaining(initialMs);
  }

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  return remaining;
}

export default function SettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <Flex as="main" direction="column" align="center" px={6} py={16} bg="bg.page" minH="100vh">
      <Flex w="full" maxW="md" direction="column" gap={8}>
        <Heading as="h1" fontSize="3xl" fontWeight="bold" color="fg.heading">
          {t("settings.title")}
        </Heading>
        <NameForm user={user} onSaved={refresh} />
        <PasswordForm user={user} onSaved={refresh} />
      </Flex>
    </Flex>
  );
}

function NameForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useCountdown(user.name_change_cooldown_ms);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.patch<User>("/auth/me", { display_name: displayName });
      onSaved();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={8}>
      <Heading as="h2" fontSize="xl" fontWeight="semibold" color="fg.heading" mb={1}>
        {t("settings.nameSectionTitle")}
      </Heading>
      <Text color="fg.subtle" fontSize="sm" mb={6}>
        {t("settings.nameSectionSubtitle")}
      </Text>
      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={4}>
        <Input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={cooldown > 0}
          border="1px solid"
          borderColor="border.default"
          borderRadius="lg"
          px={4}
          py={3}
          h="auto"
          fontSize="md"
          color="fg.heading"
          _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
          _disabled={{ bg: "stone.50", color: "stone.400" }}
        />
        {cooldown > 0 && (
          <Text fontSize="sm" color="fg.subtle">
            {t("settings.nameCooldown", { duration: formatDuration(cooldown) })}
          </Text>
        )}
        {error && (
          <Text color="red.600" fontSize="sm">
            {error}
          </Text>
        )}
        {success && (
          <Text color="green.700" fontSize="sm">
            {t("settings.nameSaved")}
          </Text>
        )}
        <Box>
          <Button
            type="submit"
            disabled={submitting || cooldown > 0}
            bg="amber.800"
            color="amber.50"
            borderRadius="full"
            fontWeight="medium"
            px={5}
            py={2.5}
            h="auto"
            _hover={{ bg: "amber.900" }}
            _disabled={{ opacity: 0.5 }}
          >
            {submitting ? t("settings.saving") : t("settings.saveName")}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}

function PasswordForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cooldown = useCountdown(user.password_change_cooldown_ms);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError(t("settings.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      onSaved();
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box bg="bg.surface" border="1px solid" borderColor="border.default" borderRadius="2xl" p={8}>
      <Heading as="h2" fontSize="xl" fontWeight="semibold" color="fg.heading" mb={1}>
        {t("settings.passwordSectionTitle")}
      </Heading>
      <Text color="fg.subtle" fontSize="sm" mb={6}>
        {t("settings.passwordSectionSubtitle")}
      </Text>
      <Flex as="form" onSubmit={handleSubmit} direction="column" gap={4}>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("settings.currentPasswordLabel")}
          </Text>
          <PasswordInput
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            placeholder={t("settings.currentPasswordPlaceholder")}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("settings.newPasswordLabel")}
          </Text>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder={t("settings.newPasswordPlaceholder")}
          />
        </Flex>
        <Flex as="label" direction="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            {t("settings.confirmNewPasswordLabel")}
          </Text>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder={t("settings.confirmNewPasswordPlaceholder")}
          />
        </Flex>
        {cooldown > 0 && (
          <Text fontSize="sm" color="fg.subtle">
            {t("settings.passwordCooldown", { duration: formatDuration(cooldown) })}
          </Text>
        )}
        {error && (
          <Text color="red.600" fontSize="sm">
            {error}
          </Text>
        )}
        {success && (
          <Text color="green.700" fontSize="sm">
            {t("settings.passwordSaved")}
          </Text>
        )}
        <Box>
          <Button
            type="submit"
            disabled={submitting || cooldown > 0}
            bg="amber.800"
            color="amber.50"
            borderRadius="full"
            fontWeight="medium"
            px={5}
            py={2.5}
            h="auto"
            _hover={{ bg: "amber.900" }}
            _disabled={{ opacity: 0.5 }}
          >
            {submitting ? t("settings.saving") : t("settings.changePassword")}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
