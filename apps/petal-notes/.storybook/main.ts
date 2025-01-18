import type { StorybookConfig } from "@storybook/sveltekit";

const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],

  addons: [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-designs",
    "@storybook/addon-a11y",
    "@storybook/experimental-addon-test",
  ],
  features: {
    backgroundsStoryGlobals: true,
    developmentModeForBuild: true,
    viewportStoryGlobals: true,
  },
  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },
} satisfies StorybookConfig;

export default config;
