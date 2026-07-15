import { defineConfig } from 'astro/config';

const usesCustomDomain = process.env.GITHUB_PAGES_CUSTOM_DOMAIN === 'true';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: usesCustomDomain
    ? 'https://gabrielafpanizza.com.ar'
    : 'https://valenzine.github.io',
  base: isGitHubPagesBuild && !usesCustomDomain ? '/gabrielafpanizza.com.ar' : undefined,
  output: 'static',
  build: {
    format: 'directory'
  }
});
