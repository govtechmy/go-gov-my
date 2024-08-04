import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: "../public", // Adjust the path to correctly reference the public directory
  build: {
    outDir: "../dist",
  },
  server: {
    port: 5173,
  },
});
