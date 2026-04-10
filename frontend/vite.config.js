import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    react({
      // This tells the Babel transformer to handle JSX in .js files
      include: /\.(js|jsx)$/,
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    // Ensuring the server catches changes properly
    watch: {
      usePolling: true,
    },
  },
});
