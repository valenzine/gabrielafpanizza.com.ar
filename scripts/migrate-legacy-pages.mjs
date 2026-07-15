import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { parse, serialize } from 'parse5';

const legacyRoot = 'archived_site';
const articleMappings = [
  { file: 'codelsol.htm', slug: 'colegio-del-sol-inteligencias-multiples', title: 'Colegio del Sol: un modelo educativo basado en las inteligencias múltiples', date: '2004-01-01', displayDate: '1994–2004', source: 'Colegio del Sol', order: 20, heroImage: '/assets/patio.jpg', heroAlt: 'Estudiantes trabajando en grupos en el patio del Colegio del Sol', project: true, projectOrder: 1, projectLabel: 'Experiencia institucional', projectSummary: 'Diez años de dirección e implementación de un modelo educativo basado en inteligencias múltiples, autonomía, valores y enseñanza personalizada.' },
  { file: 'im.htm', slug: 'distintos-modos-de-pensar-distintos-modos-de-aprender', title: 'Distintos modos de pensar, distintos modos de aprender', date: '2001-01-01', displayDate: '2001', source: 'Material de capacitación', order: 21, project: true, projectOrder: 2, projectLabel: 'Marco pedagógico', projectSummary: 'Una introducción a las múltiples maneras de ser inteligente y a sus implicancias para comprender la diversidad en el aula.' },
  { file: 'tallerim.htm', slug: 'taller-inteligencias-multiples', title: 'Estructura del taller de Inteligencias Múltiples', date: '2001-01-01', displayDate: '2001', source: 'Taller de capacitación', order: 22, heroImage: '/assets/taller-1.jpg', heroAlt: 'Participantes de un taller de Inteligencias Múltiples', project: true, projectOrder: 3, projectLabel: 'Formación docente', projectSummary: 'Estructura, objetivos y contenidos de una propuesta de capacitación para reconocer y desarrollar diferentes inteligencias.' },
  { file: 'mensaje.htm', slug: 'ensenar', title: 'Enseñar', date: '2001-01-16', displayDate: '16 de enero de 2001', source: 'Texto personal', order: 23 },
  { file: 'ser.htm', slug: 'aprender-a-ser', title: 'Aprender a ser', date: '2000-01-05', displayDate: '2000', source: 'Espejos del Alma', order: 24, heroImage: '/assets/aprender.jpg', heroAlt: 'Ilustración de la publicación Aprender a ser' },
  { file: 'vivir.htm', slug: 'aprender-a-vivir-juntos', title: 'Aprender a vivir juntos', date: '2000-01-04', displayDate: '2000', source: 'Espejos del Alma', order: 25, heroImage: '/assets/convivir.jpg', heroAlt: 'Ilustración de la publicación Aprender a vivir juntos' },
  { file: 'meama.htm', slug: 'mi-mama-me-ama', title: 'Mi mamá me ama', date: '2000-01-03', displayDate: '2000', source: 'Revista Código 5', order: 26, heroImage: '/assets/mimama.jpg', heroAlt: 'Ilustración de la publicación Mi mamá me ama' },
  { file: 'etica.htm', slug: 'formacion-etica-y-ciudadana', title: 'Formación ética y ciudadana', date: '2000-01-02', displayDate: '2000', source: 'Somos Parte', order: 27, heroImage: '/assets/etica.jpg', heroAlt: 'Ilustración de la publicación Formación ética y ciudadana', project: true, projectOrder: 4, projectLabel: 'Educación y valores', projectSummary: 'Reflexiones y propuestas para incorporar la formación ética, los sentimientos y la convivencia como contenidos escolares.' },
  { file: 'congreso.htm', slug: 'educacion-tercer-milenio', title: 'La educación en el tercer milenio', date: '1999-01-01', displayDate: '1999', source: 'Espejos del Alma', order: 28, heroImage: '/assets/congreso.jpg', heroAlt: 'Ilustración de la publicación La educación en el tercer milenio' },
];

function decodeLegacy(file) {
  return new TextDecoder('windows-1252').decode(readFileSync(path.join(legacyRoot, file)));
}

function walk(node, callback) {
  callback(node);
  for (const child of node.childNodes ?? []) walk(child, callback);
}

function textContent(node) {
  if (node.nodeName === '#text') return node.value ?? '';
  return (node.childNodes ?? []).map(textContent).join(' ');
}

function largestContentCell(html) {
  const document = parse(html);
  const cells = [];
  let body;
  walk(document, (node) => {
    if (node.tagName === 'td') cells.push(node);
    if (node.tagName === 'body') body = node;
  });
  return cells.sort((a, b) => textContent(b).length - textContent(a).length)[0] ?? body;
}

function sanitizeTree(node) {
  const banned = new Set(['script', 'style', 'img', 'form', 'input', 'iframe', 'object']);
  const presentational = new Set(['b', 'strong', 'font', 'span', 'small', 'u']);
  if (node.childNodes) {
    const cleanChildren = [];
    for (const child of node.childNodes) {
      if (banned.has(child.tagName)) continue;
      sanitizeTree(child);
      if (presentational.has(child.tagName)) {
        for (const grandchild of child.childNodes ?? []) {
          grandchild.parentNode = node;
          cleanChildren.push(grandchild);
        }
      } else {
        cleanChildren.push(child);
      }
    }
    node.childNodes = cleanChildren;
  }
  if (!node.attrs) return;
  const href = node.attrs.find((attribute) => attribute.name === 'href')?.value ?? '';
  node.attrs = node.attrs.filter((attribute) => {
    if (attribute.name !== 'href') return false;
    return !/^(?:mailto:|tel:)/i.test(attribute.value) && !/\.html?(?:#.*)?$/i.test(attribute.value);
  });
  if (node.tagName === 'a' && (/^(?:mailto:|tel:)/i.test(href) || /\.html?(?:#.*)?$/i.test(href))) {
    node.tagName = 'span';
    node.nodeName = 'span';
  }
}

function htmlToMarkdown(file) {
  const content = largestContentCell(decodeLegacy(file));
  sanitizeTree(content);
  const result = spawnSync('pandoc', ['-f', 'html', '-t', 'gfm', '--wrap=none'], {
    input: serialize(content),
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout
    .replace(/\u00a0/g, ' ')
    .replace(/^[ \t]{4,}/gm, '')
    .replace(/^\\\s*$/gm, '')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '')
    .replace(/^<?https?:\/\/usuarios\.lycos\.es\/gabrielapanizza\/?(?:>)?\s*$/gim, '')
    .replace(/^.*(?:Consultas|Dirección postal|Teléfono|usuarios\.lycos\.es\/gabrielapanizza).*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function frontmatter(fields) {
  return ['---', ...Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`), '---', ''].join('\n');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function promoteHeadings(markdown, headings) {
  const headingMap = new Map(headings.map((heading) => [heading.text, heading]));
  return markdown.split('\n').map((line) => {
    const normalized = line.trim().replace(/^([*_])(.+)\1$/, '$2').trim();
    const heading = headingMap.get(normalized);
    if (!heading) return line;
    return `${'#'.repeat(heading.level ?? 2)} ${heading.label ?? heading.text.replace(/:\s*$/, '')}`;
  }).join('\n');
}

function formatLegacyMarkdown(item, markdown) {
  let formatted = markdown.replace(/^\*\s+\*(.+)$/gm, '$1');

  const headingsByFile = {
    'im.htm': [
      { text: '¡Celebremos nuestras diferencias!' },
      { text: 'La Teoría de las Inteligencias Múltiples' },
      { text: 'Pensar la diversidad, aceptar la diversidad' },
      { text: 'BIBLIOGRAFÍA', label: 'Bibliografía' },
    ],
    'tallerim.htm': [
      { text: 'Estructura del Taller:' },
      { text: '¿Por qué es importante que la gente participe de este taller?' },
      { text: 'Objetivos' },
      { text: 'Contenidos a desarrollar' },
      { text: 'Metodologías  a utilizar en los diversos momentos del taller', label: 'Metodologías a utilizar en los diversos momentos del taller' },
      { text: 'Agenda' },
      { text: 'Primer bloque', level: 3 },
      { text: 'Segundo bloque', level: 3 },
    ],
    'ser.htm': [
      { text: 'Aprender a ser' },
      { text: 'La escuela y los valores' },
      { text: 'Aprender a vivir juntos' },
    ],
    'vivir.htm': [
      { text: 'La escuela y los valores' },
      { text: 'Aprender a vivir juntos' },
    ],
    'meama.htm': [
      { text: 'Mi mamá me mima.' },
    ],
    'etica.htm': [
      { text: 'Permiso ¿Puedo jugar?' },
      { text: 'Vayamos por partes (perdón... por bloques)' },
      { text: 'Valores Universales' },
      { text: 'Desarrollo de experiencias' },
      { text: 'BLOQUE 1: PERSONA', label: 'Bloque 1: Persona' },
      { text: 'Experiencia Nº 1: " Este/a soy yo!"', label: 'Experiencia Nº 1: «¡Este/a soy yo!»', level: 3 },
      { text: 'BLOQUE 3: NORMAS SOCIALES', label: 'Bloque 3: Normas sociales' },
      { text: 'Experiencia Nº 2: "Nos ponemos de acuerdo."', label: 'Experiencia Nº 2: «Nos ponemos de acuerdo»', level: 3 },
      { text: 'BLOQUE 2: VALORES', label: 'Bloque 2: Valores' },
      { text: 'Algunas consideraciones metodológicas:' },
      { text: 'Experiencia Nº 3 : "En busca del modelo perdido"', label: 'Experiencia Nº 3: «En busca del modelo perdido»', level: 3 },
    ],
    'congreso.htm': [
      { text: 'Paisajes de Catamarca' },
      { text: 'Postales del Congreso' },
      { text: 'La Educación en el Tercer Milenio', label: 'La educación en el tercer milenio' },
      { text: 'A desaprender' },
    ],
  };
  formatted = promoteHeadings(formatted, headingsByFile[item.file] ?? []);

  if (item.file === 'im.htm') {
    formatted = formatted
      .replace(/^\s*Profesora\s+Gabriela Fernández Panizza\\?\s*\n\s*Asesora Pedagógica\\?\s*\n\s*San Carlos de Bariloche 2005\s*$/mi, '\n\n<!-- signature -->\n\n*Profesora Gabriela Fernández Panizza*  \n*Asesora pedagógica*  \n*San Carlos de Bariloche, 2005*')
      .replace(/^Distintos modos de pensar,\\\s*\ndistintos modos de aprender\.\s*\n+/i, '')
      .replace(/^Prof\. Gabriela Fernández Panizza ©\s*\n+/i, '');
  }

  if (item.file !== 'codelsol.htm') return formatted.trim();

  const firstParagraph = formatted.indexOf('Fui convocada');
  if (firstParagraph >= 0) formatted = formatted.slice(firstParagraph);

  const headings = [
    'Un poco de historia',
    'Del dicho al hecho…',
    'Proyectos institucionales y su relación con el  desarrollo de las distintas inteligencias',
    'Proyectos de aula',
    'Resultados',
    'Aspecto académico',
    'Aspecto actitudinal',
    '¿Qué aprendimos nosotros durante el proceso?',
    'También descubrimos que',
  ];
  for (const heading of headings) {
    const expression = new RegExp(`^\\s*\\*?${escapeRegExp(heading)}\\*?\\s*$`, 'gmi');
    formatted = formatted.replace(expression, `## ${heading.replace(/  +/g, ' ')}`);
  }
  return formatted
    .replace(/^\s*Los aspectos estudiados fueron:\s*$/mi, '## Aspectos estudiados')
    .replace(/^- \* \*Los docentes/m, '- Los docentes')
    .replace(/^\s*Profesora\s+Gabriela Fernández Panizza\\?\s*Asesora Pedagógica\\?\s*San Carlos de Bariloche 2005\s*$/mi, '\n\n<!-- signature -->\n\n*Profesora Gabriela Fernández Panizza*  \n*Asesora pedagógica*  \n*San Carlos de Bariloche, 2005*')
    .trim();
}

mkdirSync('src/content/articles', { recursive: true });
for (const item of articleMappings) {
  let markdown = htmlToMarkdown(item.file);
  if (item.file === 'mensaje.htm') markdown = markdown.replaceAll('**', '');
  markdown = formatLegacyMarkdown(item, markdown);
  const fields = Object.fromEntries(Object.entries({ ...item, file: undefined, slug: undefined, available: true }).filter(([, value]) => value !== undefined));
  writeFileSync(path.join('src/content/articles', `${item.slug}.md`), `${frontmatter(fields)}\n${markdown}\n`);
  console.log(`${item.file} -> src/content/articles/${item.slug}.md`);
}

let curriculum = htmlToMarkdown('curriculum.htm')
  .replace(/^Gabriela Fernández Panizza\s*$/m, '')
  .replace(/\s*Registro Nº:[^\\\n]*(?:\\)?/gi, '')
  .replace(/\s*Legajo Nº:[^\\\n]*(?:\\)?/gi, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const curriculumFields = {
  title: 'Trayectoria detallada',
  description: 'Formación, experiencia profesional, publicaciones, cursos y participación en jornadas de Gabriela Fernández Panizza.',
  eyebrow: 'Experiencia y formación',
  heading: 'Trayectoria detallada',
  lead: 'Una relación ampliada de su formación, trabajo docente, publicaciones y participación en proyectos educativos.',
};
writeFileSync('src/content/pages/trayectoria-detallada.md', `${frontmatter(curriculumFields)}\n<!-- TODO(content): Review and update this career record with Gabriela. -->\n\n${curriculum}\n`);
console.log('curriculum.htm -> src/content/pages/trayectoria-detallada.md');
