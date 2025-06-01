import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",        // 에러 → 경고
      "@typescript-eslint/no-explicit-any": "off",         // any 허용
      "jsx-a11y/alt-text": "warn",                         // alt 경고만
      "next/next/no-img-element": "warn",                  // img도 경고만
    },
  },
];

export default eslintConfig;