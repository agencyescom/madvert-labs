import { defineConfig } from "vite";
// `bunx vite` -> http://localhost:5173/preview/  (serves assets/, audio/ and data/ from the project root)
export default defineConfig({ root: ".", server: { open: "/preview/" } });
