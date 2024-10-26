import typescriptEslint from "@typescript-eslint/eslint-plugin";
import notice from "eslint-plugin-notice";
import tsdoc from "eslint-plugin-tsdoc";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/node_modules/",
        "**/dist/",
        "**/generated-docs/",
        "packages/prosemirror-lwdita-demo/docker.js",
        "packages/prosemirror-lwdita/scripts/fix.js"
    ],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
), {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
        parser: tsParser,
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
        notice,
        tsdoc,
    },

    rules: {
        "@typescript-eslint/no-empty-interface": 0,
        "tsdoc/syntax": "warn",

        "notice/notice": ["error", {
            templateFile: "config/notice.js",
        }],

        "@typescript-eslint/no-unused-vars": ["error", {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],
    },
}, {
    files: ["**/*.spec.ts"],

    rules: {
        "@typescript-eslint/no-unused-expressions": "off",
    },
}];
