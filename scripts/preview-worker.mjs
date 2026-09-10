import { createServer } from 'node:http';
import worker from '../dist/server/index.js';
const port = Number(process.env.PORT || 4321);
createServer(async (req, res) => {
  try {
    const request = new Request(new URL(req.url || '/', `http://localhost:${port}`), { method: req.method, headers: req.headers });
    const response = await worker.fetch(request, {}, { waitUntil: promise => promise.catch(console.error) });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error(error); res.writeHead(500); res.end('Internal server error'); }
}).listen(port, '0.0.0.0', () => console.log(`Blob preview: http://localhost:${port}`));
