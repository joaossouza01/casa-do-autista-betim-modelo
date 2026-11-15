
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, resolve, sep, extname } from 'node:path'
await import('./build.mjs')
const root = resolve('dist')
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.pdf':'application/pdf' }
createServer(async (req,res) => {
  try {
    let file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname))
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return }
    if (!extname(file)) {
      const exists = await stat(file).catch(() => null)
      file = exists?.isDirectory() ? join(file, 'index.html') : file + '.html'
    }
    const data = await readFile(file)
    res.writeHead(200,{'Content-Type':types[extname(file)] ?? 'application/octet-stream'}).end(data)
  } catch {
    res.writeHead(404,{'Content-Type':types['.html']}).end(await readFile(join(root,'404.html')))
  }
}).listen(Number(process.env.PORT || 4380),'127.0.0.1',()=>console.log('http://127.0.0.1:' + (process.env.PORT || 4380)))
