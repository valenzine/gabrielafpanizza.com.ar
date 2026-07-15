# Sitio de Gabriela Fernández Panizza

Sitio estático construido con Astro. Todo el contenido editorial que debería poder actualizarse sin tocar componentes está en archivos Markdown dentro de `src/content/`.

## Dónde editar

- `src/content/pages/`: portada, biografía y Mamá Osa.
- `src/content/books/`: un archivo `.md` por libro.
- `src/content/articles/`: un archivo `.md` por artículo o publicación.
- `src/content/timeline/`: hitos de la trayectoria, ordenados mediante el campo `order`.

La página `src/content/pages/trayectoria-detallada.md` conserva la relación ampliada de experiencia, formación y participación en jornadas. Debe actualizarse con Gabriela; el comentario `TODO(content)` permanece como recordatorio interno.

Los datos entre las líneas `---` forman la ficha de cada contenido. El texto que sigue es el cuerpo de la página. Los comentarios `TODO(content)` señalan información que todavía debe confirmarse con Gabriela.

## Desarrollo

```sh
npm install
npm run dev
```

## Generar el sitio estático

```sh
npm run build
```

El resultado se genera en `dist/`.

## Volver a extraer publicaciones de la copia de WordPress

La base SQL no forma parte del sitio ni se publica. Si fuera necesario repetir la extracción:

```sh
node scripts/extract-wordpress.mjs sql/motionme_gabi.sql --write
```

El script sólo toma publicaciones públicas, elimina teléfonos, correos, formularios, scripts e imágenes incrustadas, y escribe archivos Markdown en `src/content/articles/`.

Las páginas HTML conservadas en `archived_site/` se migraron mediante `scripts/migrate-legacy-pages.mjs`. La carpeta es un archivo local e intencionalmente no se versiona. El script extrae el contenido sustantivo, descarta navegación y datos de contacto, y genera los artículos Markdown correspondientes.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy.yml` construye y publica el sitio cuando los cambios llegan a `main`. Antes del primer despliegue, en GitHub hay que seleccionar **Settings → Pages → Source: GitHub Actions** y configurar el dominio personalizado `gabrielafpanizza.com.ar` en esa misma pantalla. El archivo `public/CNAME` acompaña el dominio en el artefacto publicado, pero no reemplaza la configuración del DNS.
