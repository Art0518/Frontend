
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  plugins: [vue()],
  preview: {
    allowedHosts: ["integracion-production-8d8e.up.railway.app"]
  }
});
