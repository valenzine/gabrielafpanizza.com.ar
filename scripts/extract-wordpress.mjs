import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2] ?? 'sql/motionme_gabi.sql';
const sql = fs.readFileSync(source, 'utf8');

function decodeSqlString(value) {
  return value
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\0/g, '\0')
    .replace(/\\\\/g, '\\');
}

function parseValues(block) {
  const rows = [];
  let row = [];
  let token = '';
  let inString = false;
  let escaped = false;
  let depth = 0;

  for (let index = 0; index < block.length; index += 1) {
    const character = block[index];

    if (inString) {
      if (escaped) {
        token += `\\${character}`;
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === "'") {
        inString = false;
      } else {
        token += character;
      }
      continue;
    }

    if (character === "'") {
      inString = true;
    } else if (character === '(') {
      depth += 1;
      if (depth > 1) token += character;
    } else if (character === ')' && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        row.push(token.trim() === 'NULL' ? null : decodeSqlString(token.trim()));
        rows.push(row);
        row = [];
        token = '';
      } else {
        token += character;
      }
    } else if (character === ',' && depth === 1) {
      row.push(token.trim() === 'NULL' ? null : decodeSqlString(token.trim()));
      token = '';
    } else if (depth > 0) {
      token += character;
    }
  }

  return rows;
}

function extractTable(table) {
  const expression = new RegExp(
    'INSERT INTO `' + table + '` \\(([^)]*)\\) VALUES (.*?);(?:\\n|$)',
    'gs'
  );
  const records = [];

  for (const match of sql.matchAll(expression)) {
    const columns = match[1].split(',').map((column) => column.trim().replaceAll('`', ''));
    for (const row of parseValues(match[2])) {
      records.push(Object.fromEntries(columns.map((column, index) => [column, row[index]])));
    }
  }
  return records;
}

function sanitizePublishedContent(content) {
  return content
    .replace(/<a\b[^>]*href=["']mailto:[^"']+["'][^>]*>.*?<\/a>/gis, '')
    .replace(/<img\b[^>]*>/gis, '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '')
    .trim();
}

const posts = extractTable('wp_posts')
  .filter((post) => post.post_type === 'post' && post.post_status === 'publish')
  .map((post) => ({
    id: Number(post.ID),
    date: post.post_date.slice(0, 10),
    modified: post.post_modified.slice(0, 10),
    slug: post.post_name,
    title: post.post_title,
    excerpt: post.post_excerpt,
    content: sanitizePublishedContent(post.post_content)
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(posts, null, 2)}\n`);
} else {
  console.log(`Published posts: ${posts.length}`);
  for (const post of posts) console.log(`${post.date}\t${post.slug}\t${post.title}`);
}

if (process.argv.includes('--write')) {
  const destination = path.resolve('src/content/articles');
  fs.mkdirSync(destination, { recursive: true });
  for (const [index, post] of posts.entries()) {
    const markdown = [
      '---',
      `title: ${JSON.stringify(post.title)}`,
      `date: ${post.date}`,
      'available: true',
      `order: ${index + 1}`,
      '---',
      '',
      post.content,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(destination, `${post.slug}.md`), markdown);
  }
  console.log(`Wrote ${posts.length} Markdown posts to ${destination}`);
}
