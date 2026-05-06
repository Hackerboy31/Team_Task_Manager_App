import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true, // Sabhi hosts allow karne ke liye
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true, // Railway domain allow karne ke liye
  },
});
