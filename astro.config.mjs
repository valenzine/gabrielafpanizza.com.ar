import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://valenzine.github.io/gabrielafpanizza.com.ar/',
  output: 'static',
  build: {
    format: 'directory'
  }
});
