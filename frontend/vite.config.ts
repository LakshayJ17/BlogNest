import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // The story editor is a lazy route, so Vite would only discover these on
    // first visit and re-bundle mid-session. That can load ProseMirror twice
    // ("Duplicate use of selection JSON ID") and leave /publish blank.
    // Bundling them up front, together, avoids it.
    include: [
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-image',
      '@tiptap/extension-text-align',
      '@tiptap/extensions',
      '@tiptap/pm/state',
    ],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Long-lived vendor chunks stay cached between deploys.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'zustand', 'react-toastify', 'react-helmet-async', '@react-oauth/google'],
        },
      },
    },
  },
})
