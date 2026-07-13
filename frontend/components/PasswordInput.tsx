"use client";

import { useState } from "react";
import { Box, IconButton, Input } from "@chakra-ui/react";
import { useLanguage } from "@/context/LanguageContext";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  minLength,
  autoComplete,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  return (
    <Box position="relative">
      <Input
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        border="1px solid"
        borderColor="border.default"
        borderRadius="lg"
        px={4}
        py={3}
        pr={12}
        h="auto"
        fontSize="md"
        color="fg.heading"
        _focus={{ outline: "none", boxShadow: "0 0 0 2px var(--chakra-colors-amber-400)" }}
        placeholder={placeholder}
      />
      <IconButton
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
        title={visible ? t("common.hidePassword") : t("common.showPassword")}
        variant="plain"
        position="absolute"
        top="50%"
        right={3}
        transform="translateY(-50%)"
        color="brand.text"
        _hover={{ color: "brand.hover" }}
        minW="auto"
        h="auto"
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={20}
            height={20}
          >
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={20}
            height={20}
          >
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.7 18.7 0 0 1 4.22-5.94M9.9 4.24A9.13 9.13 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <path d="M1 1l22 22" />
          </svg>
        )}
      </IconButton>
    </Box>
  );
}
