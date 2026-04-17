import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // This tells Vite: "If the frontend asks for /compile, send it to the backend"
      '/compile': 'http://localhost:3000'
    }
  }
});