import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    singleQuote: false,
  },
  lint: {
    ignorePatterns: ["**/dist/**", "**/node_modules/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  pack: {
    entry: ["src/index.ts"],
    dts: true,
    format: ["esm"],
    sourcemap: true,
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
