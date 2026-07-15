import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gabrielafpanizza.com.ar',
  output: 'static',
  build: {
    format: 'directory'
  }
});
