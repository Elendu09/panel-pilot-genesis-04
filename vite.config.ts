import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - loaded first
          'vendor-react': ['react', 'react-dom'],
          // Router - needed for navigation
          'vendor-router': ['react-router-dom'],
          // Query - data fetching
          'vendor-query': ['@tanstack/react-query'],
          // UI library chunks - split by usage
          'vendor-radix-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
          ],
          'vendor-radix-forms': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
          ],
          'vendor-radix-dialogs': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
          ],
          'vendor-radix-navigation': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-navigation-menu',
          ],
          // Animation - defer loading
          'vendor-motion': ['framer-motion'],
          // Charts - only needed on dashboard pages
          'vendor-charts': ['recharts'],
          // Supabase - loaded after initial render
          'vendor-supabase': ['@supabase/supabase-js'],
          // Date utilities
          'vendor-date': ['date-fns'],
          // Form handling
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
}));
