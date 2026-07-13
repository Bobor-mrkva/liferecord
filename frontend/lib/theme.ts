import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        amber: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#92400e" },
          900: { value: "#78350f" },
          950: { value: "#451a03" },
        },
        stone: {
          50: { value: "#fafaf9" },
          100: { value: "#f5f5f4" },
          200: { value: "#e7e5e4" },
          300: { value: "#d6d3d1" },
          400: { value: "#a8a29e" },
          500: { value: "#78716c" },
          600: { value: "#57534e" },
          700: { value: "#44403c" },
          800: { value: "#292524" },
          900: { value: "#1c1917" },
          950: { value: "#0c0a09" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "bg.page": {
          value: { base: "{colors.amber.50}", _dark: "{colors.stone.950}" },
        },
        "bg.surface": {
          value: { base: "white", _dark: "{colors.stone.900}" },
        },
        "bg.subtle": {
          value: { base: "{colors.amber.100}", _dark: "{colors.stone.800}" },
        },
        "border.default": {
          value: { base: "{colors.amber.200}", _dark: "{colors.stone.700}" },
        },
        "border.subtle": {
          value: { base: "{colors.amber.100}", _dark: "{colors.stone.800}" },
        },
        "border.strong": {
          value: { base: "{colors.amber.300}", _dark: "{colors.stone.600}" },
        },
        "fg.heading": {
          value: { base: "{colors.stone.900}", _dark: "{colors.stone.50}" },
        },
        "fg.default": {
          value: { base: "{colors.stone.700}", _dark: "{colors.stone.300}" },
        },
        "fg.muted": {
          value: { base: "{colors.stone.600}", _dark: "{colors.stone.400}" },
        },
        "fg.subtle": {
          value: { base: "{colors.stone.500}", _dark: "{colors.stone.500}" },
        },
        "fg.faint": {
          value: { base: "{colors.stone.400}", _dark: "{colors.stone.600}" },
        },
        "brand.text": {
          value: { base: "{colors.amber.800}", _dark: "{colors.amber.400}" },
        },
        "brand.heading": {
          value: { base: "{colors.amber.900}", _dark: "{colors.amber.200}" },
        },
        "brand.hover": {
          value: { base: "{colors.amber.900}", _dark: "{colors.amber.300}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
