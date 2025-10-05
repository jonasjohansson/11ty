import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  build: {
    emptyOutDir: false,
    outDir: "dist/assets",
    rollupOptions: {
      input: "/src/js/main.js",
    },
  },
});
