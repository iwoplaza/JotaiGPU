// @ts-check
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import typegpu from 'unplugin-typegpu/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://software-mansion-labs.github.io',
  base: 'JotaiGPU',
  vite: {
    plugins: [typegpu({}), tailwindcss()],
  },
  integrations: [
    starlight({
      title: 'My Docs',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/withastro/starlight',
        },
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', slug: 'guides/example' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
    react(),
  ],
});
