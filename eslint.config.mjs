import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          types: ["function"],
          format: ["camelCase", "PascalCase"], 
        },
        {
          selector: "typeLike",
          format: ["PascalCase"], 
        },
      ],

      "no-unused-vars": "warn", 
      "no-console": ["warn", { allow: ["warn", "error"] }], 
      "prefer-const": "error", 


      "react/self-closing-comp": "error", 
      "@next/next/no-img-element": "error", 
      "@next/next/no-html-link-for-pages": "error", 
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "public/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;