import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd());

  const serverConfig =
    env.VITE_ENABLE_LOCAL_DNS === "true"
      ? {
          host: "squidl.test",
          port: 5173,
          hmr: {
            host: "squidl.test",
            protocol: "ws",
          },
        }
      : {};
  return {
    plugins: [
      react(),
      svgr(),
      // Node polyfills for Solana web3.js and Arcium client
      nodePolyfills({
        include: ["buffer", "crypto", "stream", "util"],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    server: serverConfig,
    define: {
      "process.env": {},
    },
    resolve: {
      alias: {
        // Polyfill for node crypto in browser
        crypto: "crypto-browserify",
      },
    },
  };
});
