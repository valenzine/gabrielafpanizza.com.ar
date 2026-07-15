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

The `.github/workflows/deploy.yml` workflow builds and deploys the site when changes reach `main`. Before the first deployment, select **Settings → Pages → Source: GitHub Actions** in GitHub and configure the `gabrielafpanizza.com.ar` custom domain on the same screen. The `public/CNAME` file is included in the published artifact, but it does not replace DNS configuration.
