import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import preload from "vite-plugin-preload";

export default defineConfig({
  plugins: [react(), preload()],
  base: "http://www.example.com",
  build: {
    manifest: true
  }
});
