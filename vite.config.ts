import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()) },
  base: "./",
  server: { host: "0.0.0.0", allowedHosts: true },
  preview: { host: "0.0.0.0", allowedHosts: true }
});
