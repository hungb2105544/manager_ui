// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path"; // Cần import module 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Dòng này định nghĩa '@' là bí danh cho thư mục 'src'
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
