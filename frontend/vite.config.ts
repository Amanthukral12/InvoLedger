import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  manifest: {
    name: "InvoLedger",
    short_name: "InvoLedger",
    description: "An App to Manage and Generate GST invoices for the clients",
    theme_color: "#000",
    background_color: "#000",
    display: "standalone",
    scope: "/",
    start_url: ".",
    orientation: "portrait",
    icons: [
      {
        src: "./assets/InvoLedger.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "./assets/InvoLedger.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  },
  workbox: {
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  },
};

export default defineConfig({
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA(manifestForPlugin),
    tailwindcss(),
    svgr(),
    visualizer({ open: true }),
    compression({ algorithms: ["brotliCompress"] }),
  ],
});
