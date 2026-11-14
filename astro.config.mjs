import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://orinocoaisolutions.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  security: {
    csp: {
      algorithm: 'SHA-256',
      scriptDirective: {
        resources: ["'self'", 'https://cal.com'],
      },
      styleDirective: {
        resources: ["'self'", "'unsafe-inline'", 'https://cal.com'],
      },
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/gracias') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      PUBLIC_CAL_URL: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FORM_ENDPOINT: envField.string({ context: 'client', access: 'public' }),
    },
  },
});
