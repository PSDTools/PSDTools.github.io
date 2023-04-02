import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/GPA_Calculator/",
  build: {
    sourcemap: true,
    assetsDir: "code",
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: "public/sw.js",
        swDest: "dist/sw.js",
        globDirectory: "dist",
        globPatterns: ["**/*.{html,js,css,json,png}"],
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        id: "/GPA_Calculator",
        scope: "/GPA_Calculator",
        name: "Pattonville GPA Calculator",
        display: "standalone",
        start_url: "/GPA_Calculator/",
        short_name: "GPA Calculator",
        theme_color: "#00843e",
        description: "GPA Calculator for Pattonville",
        dir: "ltr",
        orientation: "any",
        background_color: "#000000",
        related_applications: [],
        prefer_related_applications: false,
        display_override: ["window-controls-overlay"],
        icons: [
          {
            src: "/GPA_Calculator/psdr3-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        screenshots: [],
        // features: [],
        categories: [],
        shortcuts: [],
      },
    }),
  ],
});
