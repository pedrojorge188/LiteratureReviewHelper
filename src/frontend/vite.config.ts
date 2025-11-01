import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: "named", // permite { ReactComponent as ... }
        ref: true,
        titleProp: true,
      },
      include: "**/*.svg", // força aplicar a todos os .svg
    }),
  ],
});
