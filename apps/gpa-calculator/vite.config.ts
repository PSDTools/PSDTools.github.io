import tailwindcss from "@tailwindcss/vite";
import browserslist from "browserslist";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { FontaineTransform } from "fontaine";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import htmlMinifier from "vite-plugin-html-minifier";
import { VitePWA } from "vite-plugin-pwa";

const browsersList = browserslist();

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssMinify: "lightningcss",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
    sourcemap: true,
    target: browserslistToEsbuild(browsersList),
  },
  css: {
    lightningcss: {
      targets: browserslistToTargets(browsersList),
    },
    transformer: "postcss", // LightningCSS errors with "Unexpected token CloseParenthesis".
  },
  plugins: [
    tailwindcss(),
    FontaineTransform.vite({
      fallbacks: ["Verdana", "Geneva", "Tahoma", "sans-serif"],
      resolvePath: (path) => new URL(`.${path}`, import.meta.url),
    }),
    htmlMinifier({
      minify: true,
    }),
    VitePWA({
      filename: "sw.ts",
      injectManifest: {
        globDirectory: "dist",
        globPatterns: ["**/*.{html,js,css,json,png}"],
        swDest: "dist/sw.js",
        swSrc: "src/sw.ts",
      },
      injectRegister: "script-defer",
      manifest: {
        background_color: "#000000",
        // features: [],
        categories: [],
        description: "GPA Calculator for Pattonville",
        dir: "ltr",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        id: "/",
        name: "Pattonville GPA Calculator",
        orientation: "any",
        prefer_related_applications: false,
        related_applications: [],
        scope: "/",
        screenshots: [],
        short_name: "GPA Calculator",
        shortcuts: [],
        start_url: "/",
        theme_color: "#00843e",
      },
      pwaAssets: {
        htmlPreset: "2023",
        image: "public/logo.svg",
        overrideManifestIcons: true,
        preset: "minimal-2023",
      },
      registerType: "autoUpdate",
      srcDir: "src",
      strategies: "injectManifest",
      workbox: {
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
