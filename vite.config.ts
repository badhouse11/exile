import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built by Cloudflare (WORKERS_CI is set there), the site and the rooms share one address,
// so the phones connect back to wherever the page came from.
const sameOrigin = !!process.env.WORKERS_CI && !process.env.VITE_ROOM_SERVER;

export default defineConfig({
  plugins: [react()],
  define: sameOrigin ? { 'import.meta.env.VITE_ROOM_SERVER': JSON.stringify('same-origin') } : {},
});
