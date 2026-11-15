
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { books, professionals } from './original.mjs'
await import('./build.mjs')
const dist = await readdir('dist',{recursive:true})
const pages = dist.map(file=>file.replaceAll('\\','/')).filter(file=>file.endsWith('.html'))
assert.equal(pages.length,24)
for (const file of pages) {
  const body = await readFile('dist/'+file,'utf8')
  assert.match(body,/<html lang="pt-BR">/)
  assert.equal((body.match(/<h1>/g)||[]).length,1,file)
  assert.doesNotMatch(body,/href="#"|href="tel:\+55319"/)
  assert.match(body,/id="chat-input"/)
  assert.match(body,/src="\/family-chat.js"/)
  assert.doesNotMatch(body,/id="chat-actions"/)
  for (const [,url] of body.matchAll(/href="(\/[^"]*)"/g)) {
    const [path,anchor] = url.split('#')
    const target = path==='/'?'index.html':path.slice(1)+(path.includes('.')?'':'.html')
    const linked = await readFile('dist/'+target)
    if (anchor) assert.ok(linked.toString().includes('id="'+anchor+'"'),url)
  }
}
for (const [file,expected] of [
 ['index.html', ['Dryca Moreira','Ambiente seguro e afetuoso','Espaço de aprendizagem e inclusão','Níveis de suporte','role="tablist"','Saiba mais sobre quem somos','Pausar banners','data-gallery-image']],
 ['quem-somos.html', ['Missão','Visão','Nossos valores','Análise do Comportamento Aplicada']],
 ['autismo.html',['Características que podem aparecer','Inclusão e respeito','Nível 3','Atendimento Terapêutico Infantil','Ambiente Seguro e Inclusivo','Aprendizagem com Afeto','Equipe Multidisciplinar']],
 ['profissionais.html',professionals.map(item=>item.name)],
 ['ebooks.html',[...books.map(item=>item.title),'Próximos e-books']],
 ['trabalhe-conosco.html',['Data de nascimento','Redes sociais','id="cv"']],
 ['transparencia.html',['Declaração de ausência de faturamento','Consultar declaração no site oficial']],
 ['contato.html',['id="contact-form"','id="contact-subject"']],
 ['como-ser-atendido.html',['Ainda tenho dúvida','O que levar à UBS']],
]) {
  const page=await readFile('dist/'+file,'utf8')
  for (const content of expected) assert.ok(page.includes(content),file+' precisa incluir '+content)
}
const index=JSON.parse(await readFile('dist/search-index.json','utf8'))
assert.ok(index.some(entry=>entry.title==='Dra. Isabelle Matos'))
assert.ok(index.some(entry=>entry.title==='Eu Conheço Sua Alma'))
console.log('24 páginas, links e conteúdo restaurado verificados.')
