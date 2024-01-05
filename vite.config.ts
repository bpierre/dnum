import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(async ({ mode }) => ({
  build: {
    target: ["es2020", "esnext"],
    outDir: "dist",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    sourcemap: mode === "production" || "inline",
  },
  optimizeDeps: {
    entries: ["src/index.ts"],
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
}));
