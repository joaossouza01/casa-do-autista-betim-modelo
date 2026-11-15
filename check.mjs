
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { chat } from './content.mjs'
await import('./build.mjs')
const files = new Set(await readdir('dist'))
assert.equal([...files].filter(file=>file.endsWith('.html')).length,11)
for (const file of files) {
  if (!file.endsWith('.html')) continue
  const body = await readFile('dist/'+file,'utf8')
  assert.match(body,/<html lang="pt-BR">/)
  assert.equal((body.match(/<h1>/g)||[]).length,1,file)
  assert.doesNotMatch(body,/href="#"|href="tel:\+55319"/)
  for (const [,url] of body.matchAll(/href="(\/[^"]*)"/g)) {
    const [path,anchor] = url.split('#')
    const target = path==='/'?'index.html':path.slice(1)+(path.includes('.')?'':'.html')
    const linked = await readFile('dist/'+target)
    if (anchor) assert.ok(linked.toString().includes('id="'+anchor+'"'),url)
  }
}
for (const [key,topic] of Object.entries(chat)) {
  assert.ok(topic.text,key)
  for (const option of topic.options) assert.ok(chat[option],option)
}
console.log('Rotas internas, âncoras e opções do chat verificadas.')
