import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { spanishFootnotesPlugin } from './src/lib/spanish-footnotes.mjs';

const usesCustomDomain = process.env.GITHUB_PAGES_CUSTOM_DOMAIN === 'true';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: usesCustomDomain
    ? 'https://gabrielafpanizza.com.ar'
    : 'https://valenzine.github.io',
  base: isGitHubPagesBuild && !usesCustomDomain ? '/gabrielafpanizza.com.ar' : undefined,
  output: 'static',
  markdown: {
    processor: satteri({
      hastPlugins: [spanishFootnotesPlugin]
    })
  },
  build: {
    format: 'directory'
  }
});
