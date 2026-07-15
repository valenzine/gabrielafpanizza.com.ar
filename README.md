# Gabriela Fernández Panizza's website

Static website built with Astro. All editorial content intended to be updated without changing components lives in Markdown files under `src/content/`.

## Content editing

- `src/content/pages/`: home page, biography, and Mamá Osa.
- `src/content/books/`: one `.md` file per book.
- `src/content/articles/`: one `.md` file per article or publication.
- `src/content/timeline/`: career milestones, ordered with the `order` field.

`src/content/pages/trayectoria-detallada.md` contains the extended record of experience, education, and conference participation. It should be reviewed with Gabriela; the `TODO(content)` comment remains as an internal reminder.

The data between `---` delimiters is each entry's frontmatter. The following text is the page body. `TODO(content)` comments identify information that still needs confirmation with Gabriela.

## Development

```sh
npm install
npm run dev
```

## Build the static site

```sh
npm run build
```

The generated site is written to `dist/`.

## Re-extract WordPress posts

The SQL database is neither part of the website nor published. To repeat the extraction:

```sh
node scripts/extract-wordpress.mjs sql/motionme_gabi.sql --write
```

The script reads only public posts, removes phone numbers, email addresses, forms, scripts, and embedded images, and writes Markdown files to `src/content/articles/`.

The HTML pages preserved in `archived_site/` were migrated with `scripts/migrate-legacy-pages.mjs`. This is a local archive and is intentionally not tracked. The script extracts substantive content, removes navigation and contact details, and generates the corresponding Markdown articles.

## GitHub Pages deployment

The `.github/workflows/deploy.yml` workflow builds and deploys the site when changes reach `main`.

Until the custom domain is configured, the workflow uses the GitHub Pages project URL:

```text
https://valenzine.github.io/gabrielafpanizza.com.ar/
```

This is controlled by `DEPLOY_TARGET=github-pages` in the workflow. Astro applies the `/gabrielafpanizza.com.ar` base path to all internal links and local assets, while `npm run dev` continues to work at `http://localhost:4321/`.

Once `gabrielafpanizza.com.ar` is configured in **Settings → Pages**, remove `DEPLOY_TARGET` from the build step. The next deployment will publish from the domain root. The `public/CNAME` file is included in the artifact, but it does not replace DNS configuration.
