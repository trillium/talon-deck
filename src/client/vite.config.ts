import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import tailwindcss from '@tailwindcss/vite'


const outDir = path.resolve(__dirname, "../../qout/client");
fs.mkdirSync(path.dirname(outDir), { recursive: true });

export default defineConfig({
    root: path.resolve(__dirname),
    build: {
        outDir, // Output directory relative to the root
        emptyOutDir: true,
        rollupOptions: {
            input:
                path.resolve(__dirname, 'index.html'),  // without this vite searches for an index.html in packages/project1/src/index.html and sends "Could not resolve entry module (index.html)."
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"), // Make sure this matches your folder structure
        },
    },
    server: {
        proxy: {
            "/rest": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false, // Needed if backend uses HTTPS with self-signed certificates
                ws: true, // Enables WebSocket proxying
            },
            "/socket.io": {
                target: "http://localhost:3000",
                changeOrigin: true,
                ws: true, // Ensure WebSockets work
            },
        },
    },
    plugins: [react(), tailwindcss()],
});