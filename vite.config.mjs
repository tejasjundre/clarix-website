import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        product: resolve(__dirname, "product.html"),
        pricing: resolve(__dirname, "pricing.html"),
        careers: resolve(__dirname, "careers.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
