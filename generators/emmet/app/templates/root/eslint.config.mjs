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
      "no-unused-vars": "off", // Disable unused variable warnings
      "@typescript-eslint/no-unused-vars": "off", // Also disable the TypeScript-specific version
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          "extendDefaults": true,
          "types": {
            "{}": false
          }
        }
      ]
    },
  },
];

export default eslintConfig;
