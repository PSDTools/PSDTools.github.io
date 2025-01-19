import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import * as path from "node:path";
import {
  coverageConfigDefaults,
  defaultExclude,
  defineConfig,
} from "vitest/config";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],

  build: {
    cssMinify: "lightningcss",
    sourcemap: true,
  },

  css: {
    transformer: "lightningcss",
  },

  // Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
  resolve: {
    conditions: process.env["VITEST"] === undefined ? [] : ["browser"],
  },

  test: {
    exclude: ["**/build/**", ...defaultExclude],

    coverage: {
      enabled: true,
      excludeAfterRemap: true,

      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/build/**",
        "**/.storybook/**",
        "**/*.stories.*",
        "**/storybook-static/**",
      ],
    },

    sequence: {
      concurrent: true,
      shuffle: {
        files: false,
        tests: true,
      },
    },

    // FIXME: SvelteKit doesn’t support Vitest Workspaces yet,
    // so we have do define it here instead of in the workspace root.
    // See: sveltejs/kit#11356.
    workspace: [
      {
        extends: true,
        test: {
          include: ["tests/**/*.test.ts"],
          name: "petal-notes",

          typecheck: {
            enabled: true,
          },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            // The location of your Storybook config, main.js|ts
            configDir: path.join(import.meta.dirname, ".storybook"),
            // This should match your package.json script to run Storybook
            // The --ci flag will skip prompts and not open a browser
            storybookScript: "pnpm exec storybook dev --ci",
          }),
        ],
        test: {
          name: "petal-notes:storybook",

          browser: {
            enabled: true,
            // https://vitest.dev/guide/browser/playwright
            headless: true,
            provider: "playwright",
            // Storybook needs name to use `name` instead of `instances`.
            // See storybookjs/storybook#30299.
            name: "chromium",
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
