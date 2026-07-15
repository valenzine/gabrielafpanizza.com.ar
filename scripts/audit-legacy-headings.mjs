import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const legacyRoot = 'archived_site';
const files = ['codelsol.htm', 'im.htm', 'tallerim.htm', 'mensaje.htm', 'ser.htm', 'vivir.htm', 'meama.htm', 'etica.htm', 'congreso.htm'];

function walk(node, callback) {
  callback(node);
  for (const child of node.childNodes ?? []) walk(child, callback);
}

function textContent(node) {
  if (node.nodeName === '#text') return node.value ?? '';
  return (node.childNodes ?? []).map(textContent).join(' ');
}

function containsEmphasis(node) {
  let found = false;
  walk(node, (child) => {
    if (['b', 'strong', 'i', 'em'].includes(child.tagName)) found = true;
  });
  return found;
}

for (const file of files) {
  const html = new TextDecoder('windows-1252').decode(readFileSync(path.join(legacyRoot, file)));
  const document = parse(html);
  const candidates = [];
  walk(document, (node) => {
    if (!['p', 'div', 'td'].includes(node.tagName) || !containsEmphasis(node)) return;
    const text = textContent(node).replace(/\s+/g, ' ').trim();
    if (text.length >= 3 && text.length <= 130) candidates.push(text);
  });
  console.log(`\n${file}`);
  for (const candidate of [...new Set(candidates)]) console.log(`- ${candidate}`);
}
