// src/frontend/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, 
    port: 5001,
    
    hmr: {
      host: 'localhost',
      port: 5001,
      clientPort: 5001 
    }
  }
});
