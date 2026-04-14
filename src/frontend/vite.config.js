import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, 
    port: 5000,
    
    hmr: {
      host: 'localhost',
      port: 5000,
      clientPort: 5000
    }
  }
});
