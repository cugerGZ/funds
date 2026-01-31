// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'server',
  adapter: vercel(),
  vite: {
    server: {
      proxy: {
        '/api/fund': {
          target: 'https://fundmobapi.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fund/, ''),
          secure: false,
        },
        '/api/index': {
          target: 'https://push2.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/index/, ''),
          secure: false,
        },
        '/api/search': {
          target: 'https://fundsuggest.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/search/, ''),
          secure: false,
        },
      },
    },
  },
});
