import { defineConfig } from 'astro/config';

const isGitHubProjectSite = process.env.DEPLOY_TARGET === 'github-pages';

export default defineConfig({
  site: isGitHubProjectSite
    ? 'https://valenzine.github.io'
    : 'https://gabrielafpanizza.com.ar',
  base: isGitHubProjectSite ? '/gabrielafpanizza.com.ar' : undefined,
  output: 'static',
  build: {
    format: 'directory'
  }
});
