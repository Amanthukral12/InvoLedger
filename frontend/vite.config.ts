import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

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
};
export default defineConfig({
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8000", // Backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), VitePWA(manifestForPlugin), tailwindcss(), svgr()],
});
