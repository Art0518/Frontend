import vue from "@vitejs/plugin-vue";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), vue()],
  build: {
    rollupOptions: {
      external: ["jspdf"] // Trata jspdf como dependencia externa
    }
  },
  preview: {
    allowedHosts: [
      "integracion-production-8d8e.up.railway.app",
      "cafesanjuanmc.up.railway.app"
    ]
  }
});
