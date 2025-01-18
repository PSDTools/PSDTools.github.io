import cspell from "@cspell/eslint-plugin";
import type { Config as SvelteKitConfig } from "@sveltejs/kit";
import {
  sheriff,
  type SheriffSettings,
  supportedFileTypes,
  type TSESLint,
} from "eslint-config-sheriff";
import perfectionist from "eslint-plugin-perfectionist";
import sveltePlugin from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

interface Settings {
  sheriffOverrides: SheriffSettings;
  svelte: boolean | SvelteSettings;
}

interface SvelteSettings {
  enabled: boolean;
  svelteKitConfig: SvelteKitConfig;
}

const off = "off";
const warn = "warn";
const error = "error";

const sheriffOptions = {
  astro: false,
  jest: false,
  lodash: false,
  next: false,
  pathsOverrides: {
    playwrightTests: [],
  },
  playwright: false,
  react: false,
  remeda: false,

  vitest: false,
} satisfies SheriffSettings;

const baseConfig = ts.config([
  {
    files: [supportedFileTypes],
    rules: {
      "arrow-body-style": off,
      // This rule doesn't support enforcing implicit return for multiline returns.
      "arrow-return-style/arrow-return-style": off,
      curly: [error, "multi-line"],
      "func-style": [error, "declaration", { allowArrowFunctions: true }],
      "no-console": warn,
      "no-negated-condition": off,
      "no-nested-ternary": off,
      "no-plusplus": [error, { allowForLoopAfterthoughts: true }],
      "no-void": [error, { allowAsStatement: true }],
      "operator-assignment": [warn, "always"],
      "prefer-destructuring": off,

      "@typescript-eslint/ban-ts-comment": [
        error,
        {
          "ts-check": false,
          "ts-expect-error": { descriptionFormat: "^\\(TS\\d+\\): .+$" },
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        warn,
        { allowExpressions: true },
      ],
      "@typescript-eslint/naming-convention": off,
      "@typescript-eslint/no-confusing-void-expression": warn,
      "@typescript-eslint/no-non-null-assertion": off,
      "@typescript-eslint/prefer-destructuring": warn,
      "@typescript-eslint/prefer-function-type": warn,
      "@typescript-eslint/promise-function-async": warn,
      "@typescript-eslint/restrict-template-expressions": [
        error,
        { allowNumber: true },
      ],
      "@typescript-eslint/return-await": [error, "always"],
      "@typescript-eslint/strict-boolean-expressions": warn,
      "@typescript-eslint/switch-exhaustiveness-check": error,

      "import/no-unresolved": [error, { ignore: ["^virtual:"] }],
      "import/no-useless-path-segments": [error, { noUselessIndex: false }],

      "jsdoc/check-tag-names": off, // TSDoc is used instead.
      "jsdoc/convert-to-jsdoc-comments": off, // Experimental, has bugs.

      "simple-import-sort/imports": off,

      "unicorn/expiring-todo-comments": warn,
      "unicorn/no-negated-condition": error,
      "unicorn/no-typeof-undefined": warn,
      "unicorn/prefer-query-selector": warn,
    },
  },
  {
    files: ["*.js"],
    rules: {
      "tsdoc/syntax": off,
    },
  },
  {
    files: [supportedFileTypes],
    plugins: { perfectionist },
    settings: {
      perfectionist: {
        type: "natural",

        partitionByComment: true,
        partitionByNewLine: true,
      },
    },

    rules: {
      ...perfectionist.configs["recommended-natural"].rules,
      "perfectionist/sort-imports": [
        error,
        {
          groups: [
            ["side-effect", "side-effect-style"],
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
            "object",
          ],
          internalPattern: ["^$lib/.*"],
          partitionByNewLine: false,
        },
      ],
      "perfectionist/sort-modules": off,
      "perfectionist/sort-union-types": [
        error,
        {
          groups: ["unknown", "nullish"],
        },
      ],
    },
  },
  {
    plugins: { "@cspell": cspell },
    rules: {
      "@cspell/spellchecker": [
        warn,
        {
          configFile: import.meta.resolve("../../../cspell.json"),
        },
      ],
    },
  },
]);

function svelteConfig({
  project,
  settings = {},
}: {
  project: string | string[];
  settings?: Partial<SvelteSettings>;
}): TSESLint.FlatConfig.ConfigArray {
  const { svelteKitConfig } = settings;

  return ts.config([
    ...sveltePlugin.configs.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
    },
    {
      files: ["**/*.svelte"],

      languageOptions: {
        parserOptions: {
          extraFileExtensions: [".svelte"],
          parser: ts.parser,
          project,
          svelteConfig: svelteKitConfig,
        },
      },
      rules: {
        "@typescript-eslint/no-unsafe-call": off,
        "storybook/default-exports": off,

        "svelte/sort-attributes": warn,
      },
    },
  ]);
}

export function config({
  sheriffOverrides,
  svelte,
}: Partial<Settings> = {}): TSESLint.FlatConfig.ConfigArray {
  const combinedSheriffOptions = {
    ...sheriffOptions,
    ...sheriffOverrides,
  };

  const builtConfig = [...sheriff(combinedSheriffOptions), ...baseConfig];

  if (svelte === true) {
    builtConfig.push(...svelteConfig({ project: "./tsconfig.json" }));
  } else if (
    typeof svelte === "object" &&
    Object.hasOwn(svelte, "enabled") &&
    svelte.enabled
  ) {
    builtConfig.push(
      ...svelteConfig({ project: "./tsconfig.json", settings: svelte }),
    );
  }

  return builtConfig;
}
