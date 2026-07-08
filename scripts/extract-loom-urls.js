const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Kmia/Vs Code/Modele App EWA/_next/static/chunks';
const files = fs.readdirSync(dir);
let loomUrls = [];
let loomContexts = [];
for (const f of files) {
  if (!f.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const matches = [...content.matchAll(/https:\/\/www\.loom\.com\/share\/[^"'\s\)\]\,]+/g)];
  for (const m of matches) {
    loomUrls.push(m[0]);
    const start = Math.max(0, m.index - 80);
    const end = Math.min(content.length, m.index + m[0].length + 80);
    loomContexts.push({url: m[0], context: content.slice(start, end), file: f});
  }
}
console.log('Total loom URLs found:', loomUrls.length);
console.log('Unique:', [...new Set(loomUrls)].length);
fs.writeFileSync('C:/Users/Kmia/Vs Code/template-ewa-app/scripts/loom_urls_from_build.json', JSON.stringify({count: loomUrls.length, unique: [...new Set(loomUrls)], contexts: loomContexts.slice(0,50)}, null, 2));
