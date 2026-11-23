// Rebuilds the small ONE Mobile fonts from the characters the site actually uses.
// Run after adding NEW Korean text (a character that is not in the subset falls back to Pretendard):
//   npm i subset-font        (once, anywhere, e.g. in this folder)
//   node tools/subset-fonts.mjs
// Originals come from the Noonnu CDN (ONE Mobile Regular / Title) and are cached in tools/.font-cache.
import subsetFont from 'subset-font';
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = {
  Regular: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-Regular.woff',
  Title: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-Title.woff'
};

// every file that can hold visible text
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'tools', 'office-assistant-update', 'vendor'].includes(f.name)) continue;
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(html|js|css)$/.test(f.name) && !/lenis\.min/.test(f.name)) files.push(p);
  }
})(root);

let text = '';
for (let c = 0x20; c <= 0x7e; c++) text += String.fromCharCode(c);
const set = new Set();
for (const f of files) {
  for (const ch of fs.readFileSync(f, 'utf8')) {
    const c = ch.codePointAt(0);
    if ((c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3131 && c <= 0x318e) || (c >= 0x2000 && c <= 0x2bff) || (c >= 0xa0 && c <= 0x24f)) set.add(ch);
  }
}
text += [...set].join('');

const cache = path.join(root, 'tools', '.font-cache');
fs.mkdirSync(cache, { recursive: true });
for (const [name, url] of Object.entries(SRC)) {
  const orig = path.join(cache, path.basename(url));
  if (!fs.existsSync(orig)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);
    fs.writeFileSync(orig, Buffer.from(await res.arrayBuffer()));
  }
  const out = await subsetFont(fs.readFileSync(orig), text, { targetFormat: 'woff2' });
  const dest = path.join(root, 'assets', 'fonts', `ONE-Mobile-${name}-subset.woff2`);
  fs.writeFileSync(dest, out);
  console.log(`${name}: ${out.length} bytes, ${[...text].length} glyphs -> ${path.relative(root, dest)}`);
}
