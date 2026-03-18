// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import AstroPWA from "@vite-pwa/astro";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      injectRegister: null,
      registerType: "autoUpdate",
      manifest: {
        name: "Secret Hitler - Pass & Play",
        short_name: "Secret Hitler",
        description: "A single-device Secret Hitler board game for 5-10 players.",
        theme_color: "#2a2118",
        background_color: "#1b130d",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "landscape",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webp,png,ico,json,webmanifest,woff,woff2}"],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
  },

  output: "static",
  adapter: cloudflare({
    imageService: "compile",
  }),
});
