import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
// Package the small Astro output with its API so both Pages and Sites run the same code.
// Assets are embedded to avoid assumptions about host-specific asset binding names.
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const assets = {};
async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['_headers', '_worker.js', 'server'].includes(entry.name)) continue;
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await collect(join(directory, entry.name), relative);
    else assets[relative] = { type: types[extname(entry.name)] || 'application/octet-stream', body: (await readFile(join(directory, entry.name))).toString('base64') };
  }
}
await collect('dist');
const securityHeaders = {};
for (const line of (await readFile('public/_headers', 'utf8')).split('\n')) {
  const match = line.match(/^\s+([^:]+):\s*(.+)$/);
  if (match) securityHeaders[match[1]] = match[2];
}
const api = (await readFile('server/gallery-api.mjs', 'utf8')).replaceAll('export ', '');
const worker = (await readFile('server/worker.mjs', 'utf8')).replace(/^import .*\n/, '').replaceAll('export ', '');
const source = `${api}\n${worker}\nexport default createWorker(${JSON.stringify(assets)}, ${JSON.stringify(securityHeaders)});\n`;
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
await writeFile('dist/server/index.js', source);
await writeFile('dist/_worker.js', source);
try { await writeFile('dist/.openai/hosting.json', await readFile('.openai/hosting.json')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log(`Worker built: ${Object.keys(assets).length} assets and /api/images (${(Buffer.byteLength(source) / 1024 / 1024).toFixed(2)} MB).`);
