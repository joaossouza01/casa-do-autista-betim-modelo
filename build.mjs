
import { restore, galleryFooter } from './restore.mjs'
import { mkdir, writeFile, cp, access } from 'node:fs/promises'
import { contact as c, media, steps, documents, faq, balanceFiles } from './content.mjs'

const nav = [['/','Início'],['/quem-somos','Sobre nós'],['/autismo','Autismo'],['/profissionais','Profissionais'],['/transparencia','Transparência'],['/ebooks','E-books'],['/trabalhe-conosco','Trabalhe conosco'],['/contato','Contato']]
const more = [['/como-ser-atendido','Como ser atendido'],['/oficinas','Oficinas']]
const icons = {
  search:'<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chat:'<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H4l1.6-3.3A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 12h7"/>',
  heart:'<path d="M20 8.5c0 4.5-8 9.5-8 9.5s-8-5-8-9.5a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8Z"/>',
  home:'<path d="m3 10 9-7 9 7m-2-1v11H5V9m5 11v-6h4v6"/>',
  file:'<path d="M14 3H6v18h12V7l-4-4Zm0 0v5h4M9 13h6m-6 4h6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  spark:'<path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l3 3m8 8 3 3m0-14-3 3m-8 8-3 3"/>',
  people:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5v2"/>'
}
const icon = (name) => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + icons[name] + '</svg>'
const a = (href,text,cls='') => '<a class="' + cls + '" href="' + href + '">' + text + '</a>'
const btn = (href,text,cls='primary') => a(href,text + icon('arrow'),'button ' + cls)
const chip = (text) => '<span class="eyebrow"><i></i>' + text + '</span>'
const navLinks = (items,path) => items.map(([url,label])=>'<a href="' + url + '"' + (url===path?' aria-current="page"':'') + '>' + label + '</a>').join('')
const chatBtn = (text='Tirar dúvidas no chat',style='secondary') => '<button type="button" data-chat class="button ' + style + '">' + icon('chat') + text + '</button>'
const title = (tag,heading,description) => '<section class="inner-hero"><div class="wrap">'+ chip(tag) + '<h1>' + heading + '</h1><p>' + description + '</p></div></section>'
const grid = (items) => '<div class="cards">' + items.map(([label,body,shape='heart',color='lilac',link])=>'<article class="card"><div class="symbol '+color+'">' + icon(shape) + '</div><h3>'+label+'</h3><p>'+body+'</p>'+(link? a(link[0],link[1] + ' ' + icon('arrow'),'text-link'):'')+'</article>').join('') + '</div>'
const stepCards = () => grid(steps.map(([heading,body],index)=>[heading,body,['home','people','check'][index],['lilac','sun','mint'][index]]))
const questionList = (items=faq) => '<div class="questions">'+items.map(([q,r])=>'<details><summary>'+q+icon('plus')+'</summary><p>'+r+'</p></details>').join('')+'</div>'
const links = (path) => '<header class="header"><div class="wrap head-row"><a class="brand" href="/" aria-label="Casa dos Autistas de Betim, início"><img src="'+media.logo+'" alt="Casa dos Autistas"></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" type="button">Menu</button><nav id="site-nav" aria-label="Menu principal">'+ navLinks(nav,path) + '<a href="/buscar" class="nav-search" aria-label="Buscar no site">'+icon('search')+'</a></nav>'+btn('/como-ser-atendido','Como ser atendido','primary head-cta')+'</div></header>'
const footer = (path) => '<footer class="footer"><div class="wrap foot-grid"><div><a href="/" class="brand"><img loading="lazy" src="'+media.logo+'" alt="Casa dos Autistas"></a><p>Acolhimento, desenvolvimento e inclusão em Betim, Minas Gerais.</p></div><div><h2>Conheça a Casa</h2>'+navLinks(nav,path)+'</div><div><h2>Informações</h2>'+navLinks(more,path)+'</div><div><h2>Fale com a Casa</h2>'+a(c.telephone,c.phone)+a('mailto:'+c.email,'Enviar e-mail')+a(c.instagram,'Instagram')+'</div></div>'+galleryFooter(c.instagram)+'<div class="wrap foot-end"><span>Casa dos Autistas de Betim</span><span>CNPJ 05.161.667/0001-90</span><span>Modelo para revisão</span></div></footer>'
const dialog = '<button type="button" data-chat class="float-chat" aria-label="Preciso de ajuda" aria-haspopup="dialog">'+icon('chat')+'<span>Preciso de ajuda</span></button><dialog id="family-chat" aria-labelledby="chat-heading"><div class="chat-head"><span class="chat-icon">'+icon('chat')+'</span><div><h2 id="chat-heading">Guia da Casa</h2><p>Casa dos Autistas de Betim</p></div><button type="button" id="close-chat" aria-label="Fechar chat">×</button></div><div class="chat-stage"><span id="chat-stage"></span><span class="chat-meter" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="chat-stream"><div id="chat-history" role="log" aria-live="polite" aria-relevant="additions"></div></div><div class="chat-compose"><form id="chat-form"><label for="chat-input" class="visually-hidden">Sua resposta</label><input id="chat-input" placeholder="Digite seu primeiro nome" autocomplete="off" maxlength="300" required><button type="submit" class="button primary">Enviar '+icon('arrow')+'</button></form><div class="chat-privacy"><span>Use só o primeiro nome. A conversa fica nesta janela.</span><button type="button" id="restart-chat">Recomeçar</button></div></div></dialog>'
const pages = {
  '/': ['Início','Terapias, oficinas e orientação às famílias na Casa dos Autistas de Betim.',''],
  '/como-ser-atendido': ['Como ser atendido','Veja como iniciar o encaminhamento pela UBS e acompanhar a solicitação.',
    title('GUIA PARA FAMÍLIAS','Como ser atendido','Veja onde começar, o que levar e como acompanhar um encaminhamento pelo SUS de Betim.')+
    '<section class="section wrap">'+stepCards()+'<div class="notice">'+icon('chat')+'<div><h2>Prefere seguir por etapas?</h2><p>O guia interativo responde às dúvidas mais comuns das famílias.</p></div>'+chatBtn('Abrir guia interativo')+'</div></section>'+
    '<section id="documentos" class="section tinted"><div class="wrap narrow"><h2>O que levar à UBS</h2><p>Use a lista para se preparar e confirme na sua UBS o que ela solicita para o seu caso. A Prefeitura publica uma lista geral para consultas especializadas.</p><ul class="checklist">'+documents.map((item,i)=>'<li><label><input type="checkbox" name="documento-'+i+'">'+item+'</label></li>').join('')+'</ul><p class="small">As marcações ficam apenas nesta página e nenhum documento é enviado.</p>'+a(c.specialized,'Consultar a lista geral da Prefeitura '+icon('arrow'),'text-link')+'</div></section>'+
    '<section class="section wrap narrow"><h2>Perguntas frequentes</h2>'+questionList()+'<p class="source">'+a(c.city,'Linha de Cuidado Intelectual de Betim')+' · '+a(c.upa,'Carta de Serviços das UPAs')+'</p></section>'
  ],
  '/quem-somos': ['Quem Somos','Conheça a Casa dos Autistas de Betim e seu trabalho com as famílias.',''],
  '/oficinas': ['Oficinas','Conheça as atividades e os projetos da Casa dos Autistas.',
    title('ATIVIDADES','Oficinas e convivência','Experiências em grupo para brincar, descobrir interesses, explorar materiais e praticar habilidades do cotidiano.')+
    '<section class="section wrap">'+grid([['Oficina gastronômica','Preparar receitas em grupo abre espaço para experimentar texturas, seguir etapas e participar com autonomia.','heart','sun',['https://www.instagram.com/casadoautistabetim/reel/DfAlMgmOCMr/','Ver uma oficina']],['Teatro e expressão','Apresentações e atividades culturais convidam à imaginação, à comunicação e à convivência.','spark','lilac',['https://www.instagram.com/casadoautistabetim/reel/DfR2iB0RiV4/','Ver atividade']],['Convivência e parcerias','Encontros e ações com parceiros aproximam as famílias e ampliam as experiências das crianças.','people','mint',[c.instagram,'Acompanhar no Instagram']]])+'</section>'
  ],
  '/autismo': ['Autismo','Informações sobre autismo e diferentes necessidades de apoio.',''],
  '/profissionais': ['Profissionais','Conheça a equipe da Casa dos Autistas de Betim.',''],
  '/ebooks': ['E-books','Catálogo de e-books da Casa dos Autistas de Betim.',''],
  '/transparencia': ['Transparência','Documentos institucionais e canais para solicitar a prestação de contas.',
    title('INSTITUCIONAL','Transparência','Consulte a documentação institucional da Casa dos Autistas de Betim.')+
    '<section class="section wrap narrow"><h2>Balanços patrimoniais</h2>'+
    (balanceFiles.length? '<ul class="documents">'+balanceFiles.map(({year,file})=>'<li>'+icon('file')+'<span>Balanço Patrimonial '+year+'</span><a class="button secondary" href="/documentos/'+file+'" download>Baixar PDF</a></li>').join('')+'</ul>' :
      '<div class="card"><div class="symbol lilac">'+icon('file')+'</div><h3>Balanço Patrimonial 2024</h3><p>PDF oficial indisponível nesta versão. Você pode solicitar uma cópia à equipe da Casa.</p>'+btn('mailto:'+c.email+'?subject=Solicita%C3%A7%C3%A3o%20de%20balan%C3%A7o%20patrimonial','Solicitar documento','secondary')+'</div>')+'</section>'
  ],
  '/trabalhe-conosco': ['Trabalhe conosco','Prepare a sua candidatura com currículo em PDF.',
    title('FAÇA PARTE','Trabalhe conosco','Apresente sua experiência à equipe da Casa dos Autistas de Betim.')+
    '<section class="section wrap split align-start"><div><h2>Envie seu currículo</h2><p>Preencha seus dados e selecione o currículo em PDF. O formulário cria um rascunho de e-mail com o PDF anexado. Revise e envie pelo seu aplicativo de e-mail.</p><p class="small">Use o PDF do currículo e evite incluir documentos pessoais como RG ou CPF.</p></div><form class="card resume" id="resume-form" data-recipient="'+c.email+'"><div class="field"><label for="name">Nome completo</label><input id="name" name="name" autocomplete="name" maxlength="100" required></div><div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" maxlength="150" required></div><div class="field"><label for="area">Área de interesse</label><input id="area" name="area" placeholder="Ex.: Psicologia" maxlength="100" required></div><div class="field"><label for="cv">Currículo (PDF, até 5 MB)</label><input id="cv" name="cv" type="file" accept=".pdf,application/pdf" required><p id="file-message" class="small" aria-live="polite">Selecione um arquivo do seu dispositivo.</p></div><label class="consent"><input type="checkbox" name="consent" required>Autorizo a Casa a entrar em contato sobre minha candidatura.</label><button type="submit" class="button primary">Preparar e-mail '+icon('arrow')+'</button><div id="resume-confirmation" hidden><p><strong>Seu rascunho está pronto.</strong> Abra o arquivo em um aplicativo compatível com .eml e envie a mensagem. Se preferir abrir um novo e-mail, anexe o PDF manualmente.</p><a id="resume-draft" class="button primary" download="candidatura-casa-dos-autistas.eml">Baixar rascunho com PDF</a> <a id="resume-mail" class="button secondary">Abrir aplicativo de e-mail</a></div></form></section>'
  ],
  '/contato': ['Contato','Telefone, e-mail, WhatsApp e localização da Casa dos Autistas de Betim.',
    title('FALE COM A CASA','Estamos aqui para orientar','Use os canais abaixo para dúvidas sobre as atividades, a equipe ou o atendimento.')+
    '<section class="section wrap">'+grid([['WhatsApp',c.phone,'chat','mint',[c.whatsapp,'Abrir conversa']],['E-mail',c.email,'file','lilac',['mailto:'+c.email,'Enviar e-mail']],['Instagram','@casadoautistabetim','heart','sun',[c.instagram,'Acessar perfil']]])+
    '<div class="notice">'+icon('home')+'<div><h2>Localização de atendimento</h2><p>Rua Goiás, 219 · Espírito Santo · Betim, MG</p><p class="small">Local divulgado pela Prefeitura. Confirme o horário com a equipe antes de ir.</p></div>'+btn(c.map,'Ver no mapa','secondary')+'</div></section>'
  ],
  '/404': ['Página não encontrada','Volte à página inicial da Casa dos Autistas.',title('CASA DOS AUTISTAS','Página não encontrada','A página pode ter sido movida.')+'<section class="section wrap">'+btn('/','Voltar ao início')+'</section>']
}
restore(pages,{c,media,title,btn,chip,a,chatBtn,icon,grid,stepCards,questionList,faq})
pages['/buscar'] = ['Buscar','Busque no site da Casa dos Autistas.',title('CASA DOS AUTISTAS','Buscar no site','Encontre páginas, profissionais e e-books.')+'<section class="section wrap narrow"><form id="search-form" class="search-form" role="search"><label class="visually-hidden" for="search-term">O que você procura?</label><input id="search-term" name="q" placeholder="Ex.: currículo, autismo, oficinas" required><button type="submit" class="button primary">Buscar</button></form><p id="search-status" role="status"></p><ul id="search-results" class="search-results"></ul></section>']
function layout(path,[name,description,body]) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+description+'"><meta name="robots" content="noindex"><meta name="theme-color" content="#fcf9f2"><title>'+name+' | Casa dos Autistas de Betim</title><link rel="icon" href="'+media.logo+'"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="/site.css"><script type="module" src="/site.js"></script><script type="module" src="/family-chat.js"></script></head><body><a href="#main" class="skip">Pular para o conteúdo</a><div class="preview-note">Modelo de demonstração <a href="'+c.official+'">Ver o site atual</a></div>'+links(path)+'<main id="main">'+body+'</main>'+footer(path)+dialog+'</body></html>'
}
await mkdir('dist',{recursive:true})
await cp('public','dist',{recursive:true})
for (const doc of balanceFiles) await access('dist/documentos/'+doc.file)
const facts = {upa:faq[1][1],laudo:faq[0][1],wait:'Confirme na sua UBS se o encaminhamento está registrado e mantenha seu telefone atualizado. A Regulação organiza os agendamentos conforme o protocolo e as vagas da rede.',vaga:faq[4][1],contato:'A equipe da Casa esclarece dúvidas sobre atendimento pelo WhatsApp. O acompanhamento de um encaminhamento é feito pela UBS de referência.',ubs:steps[0][1]}
const resources = {guide:['Ver guia de atendimento','/como-ser-atendido'],checklist:['Abrir checklist','/como-ser-atendido#documentos'],upa:['Consultar a Prefeitura',c.upa],whatsapp:['Falar com a Casa no WhatsApp',c.whatsapp]}
await writeFile('dist/guia-chat.js','export const facts = '+JSON.stringify(facts)+'; export const documents = '+JSON.stringify(documents)+'; export const resources = '+JSON.stringify(resources))
const searchIndex = Object.entries(pages).filter(([path])=>!['/buscar','/404','/teacher','/classes'].includes(path)).map(([path,[title,desc,body]])=>({path,title,desc,text:body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ')}))
await writeFile('dist/search-index.json',JSON.stringify(searchIndex))
for (const [path,page] of Object.entries(pages)) {
  const filename='dist/'+(path==='/'?'index':path.slice(1))+'.html'
  await mkdir(filename.slice(0,filename.lastIndexOf('/')),{recursive:true})
  await writeFile(filename,layout(path,page))
}
console.log(Object.keys(pages).length+' páginas geradas.')
