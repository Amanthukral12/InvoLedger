import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

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
  plugins: [react(), tailwindcss(), svgr()],
});
