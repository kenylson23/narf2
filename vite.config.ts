import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@shared', replacement: path.resolve(__dirname, 'shared') },
      { find: '@assets', replacement: path.resolve(__dirname, 'public/assets') },
    ],
  },
  root: path.resolve(__dirname, "."),
  base: '/',
  publicDir: 'public',
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsDir: 'assets',
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    cssMinify: mode === 'production',
    reportCompressedSize: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: [
            '@radix-ui/react-slot', 
            '@radix-ui/react-dialog', 
            '@radix-ui/react-select',
            '@radix-ui/themes'
          ],
          animation: ['framer-motion'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react'],
          form: ['react-hook-form', '@hookform/resolvers'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (['png', 'jpe?g', 'gif', 'svg', 'webp', 'avif'].includes(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 8080,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
