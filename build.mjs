
import { mkdir, writeFile, cp, access } from 'node:fs/promises'
import { contact as c, media, steps, documents, faq, chat, balanceFiles } from './content.mjs'

const nav = [['/quem-somos','Sobre a Casa'],['/oficinas','Oficinas'],['/profissionais','Equipe'],['/autismo','Autismo'],['/contato','Contato']]
const more = [['/como-ser-atendido','Como ser atendido'],['/ebooks','Materiais'],['/transparencia','Transparência'],['/trabalhe-conosco','Trabalhe conosco']]
const icons = {
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
const links = (path) => '<header class="header"><div class="wrap head-row"><a class="brand" href="/" aria-label="Casa dos Autistas de Betim, início"><img src="'+media.logo+'" alt="Casa dos Autistas"></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" type="button">Menu</button><nav id="site-nav" aria-label="Menu principal">'+ navLinks(nav,path) +'</nav>'+btn('/como-ser-atendido','Como ser atendido','primary head-cta')+'</div></header>'
const footer = (path) => '<footer class="footer"><div class="wrap foot-grid"><div><a href="/" class="brand"><img loading="lazy" src="'+media.logo+'" alt="Casa dos Autistas"></a><p>Acolhimento, desenvolvimento e inclusão em Betim, Minas Gerais.</p></div><div><h2>Conheça a Casa</h2>'+navLinks(nav,path)+'</div><div><h2>Informações</h2>'+navLinks(more,path)+'</div><div><h2>Fale com a Casa</h2>'+a(c.telephone,c.phone)+a('mailto:'+c.email,'Enviar e-mail')+a(c.instagram,'Instagram')+'</div></div><div class="wrap foot-end"><span>Casa dos Autistas de Betim</span><span>CNPJ 05.161.667/0001-90</span><span>Modelo para revisão</span></div></footer>'
const dialog = '<button type="button" data-chat class="float-chat" aria-label="Precisa de ajuda?" aria-haspopup="dialog">'+icon('chat')+'<span>Precisa de ajuda?</span></button><dialog id="family-chat" aria-labelledby="chat-heading"><div class="chat-head"><span class="chat-icon">'+icon('chat')+'</span><div><h2 id="chat-heading">Guia das famílias</h2><p>Orientação sobre o atendimento</p></div><button type="button" id="close-chat" aria-label="Fechar chat">×</button></div><div class="chat-content"><div id="chat-history" role="log" aria-live="polite" aria-relevant="additions"></div><div id="chat-actions" aria-label="Escolha uma resposta"></div></div><button type="button" id="restart-chat">Recomeçar conversa</button></dialog>'
const pages = {
  '/': ['Início','Terapias, oficinas e orientação às famílias na Casa dos Autistas de Betim.',
    '<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">'+chip('CASA DOS AUTISTAS · BETIM / MG')+
    '<h1>Acolhimento para crescer <em>no seu ritmo.</em></h1><p>Terapias, oficinas de desenvolvimento e apoio às famílias de crianças e adolescentes autistas em Betim.</p><div class="actions">'+btn('/como-ser-atendido','Como ser atendido')+chatBtn('Tirar dúvidas')+'</div><div class="entry-note">'+icon('check')+' Acesso pela regulação do SUS de Betim</div></div><div class="hero-visual"><div class="hero-photo"><img fetchpriority="high" src="'+media.cover+'" alt="Criança sorrindo em um ambiente de atividades"></div><span class="hero-spark">'+icon('spark')+'</span><span class="photo-tag">'+icon('heart')+' Brincar também é aprender</span><span class="hero-dot"></span></div></div></section>'+
    '<section class="section wrap"><div class="section-title"><div>'+chip('PARA FAMÍLIAS')+'<h2>Por onde começar</h2></div>'+a('/como-ser-atendido','Ver o guia completo '+icon('arrow'),'text-link')+'</div>'+stepCards()+'</section>'+
    '<section class="section tinted"><div class="wrap split"><div class="feature-image"><img loading="lazy" src="'+media.activity+'" alt="Registro de uma atividade na Casa dos Autistas"></div><div>'+chip('A CASA NO DIA A DIA')+'<h2>Aprender, brincar e conviver</h2><p>Nas oficinas, crianças e adolescentes têm espaço para experimentar, se expressar e participar no próprio ritmo. A equipe trabalha de forma integrada com as famílias.</p>'+btn('/oficinas','Conheça as oficinas')+'</div></div></section>'+
    '<section class="section wrap narrow">'+chip('DÚVIDAS DAS FAMÍLIAS')+'<h2>Perguntas frequentes</h2>'+questionList(faq.slice(0,3))+'</section>'
  ],
  '/como-ser-atendido': ['Como ser atendido','Veja como iniciar o encaminhamento pela UBS e acompanhar a solicitação.',
    title('GUIA PARA FAMÍLIAS','Como ser atendido','Veja onde começar, o que levar e como acompanhar um encaminhamento pelo SUS de Betim.')+
    '<section class="section wrap">'+stepCards()+'<div class="notice">'+icon('chat')+'<div><h2>Prefere seguir por etapas?</h2><p>O guia interativo responde às dúvidas mais comuns das famílias.</p></div>'+chatBtn('Abrir guia interativo')+'</div></section>'+
    '<section id="documentos" class="section tinted"><div class="wrap narrow"><h2>O que levar à UBS</h2><p>Use a lista para se preparar e confirme na sua UBS o que ela solicita para o seu caso. A Prefeitura publica uma lista geral para consultas especializadas.</p><ul class="checklist">'+documents.map((item,i)=>'<li><label><input type="checkbox" name="documento-'+i+'">'+item+'</label></li>').join('')+'</ul><p class="small">As marcações ficam apenas nesta página e nenhum documento é enviado.</p>'+a(c.specialized,'Consultar a lista geral da Prefeitura '+icon('arrow'),'text-link')+'</div></section>'+
    '<section class="section wrap narrow"><h2>Perguntas frequentes</h2>'+questionList()+'<p class="source">'+a(c.city,'Linha de Cuidado Intelectual de Betim')+' · '+a(c.upa,'Carta de Serviços das UPAs')+'</p></section>'
  ],
  '/quem-somos': ['Sobre a Casa','Conheça a Casa dos Autistas de Betim e seu trabalho com as famílias.',
    title('SOBRE A CASA','Um lugar de acolhimento e inclusão','A Casa dos Autistas de Betim oferece atividades, acompanhamento e apoio às famílias, respeitando as formas de aprender, comunicar e conviver de cada pessoa.')+
    '<section class="section wrap split"><div class="feature-image"><img loading="lazy" src="'+media.activity+'" alt="Registro de uma atividade da Casa dos Autistas"></div><div><h2>O que nos orienta</h2><p>Promover o bem-estar, a participação social e a autonomia de pessoas autistas. A equipe atua em conjunto e orienta as famílias para que o cuidado faça sentido na rotina de cada criança.</p>'+btn('/profissionais','Conheça as áreas da equipe')+'</div></section>'+
    '<section class="section tinted"><div class="wrap">'+grid([['Escuta das famílias','O acolhimento começa pelas necessidades e experiências de cada família.','heart'],['Respeito à individualidade','Cada pessoa tem preferências, formas de comunicação e necessidades de apoio próprias.','spark','sun'],['Trabalho em equipe','Profissionais de áreas diferentes colaboram no desenvolvimento e na convivência.','people','mint']])+'</div></section>'
  ],
  '/oficinas': ['Oficinas','Conheça as atividades e os projetos da Casa dos Autistas.',
    title('ATIVIDADES','Oficinas e convivência','Experiências em grupo para brincar, descobrir interesses, explorar materiais e praticar habilidades do cotidiano.')+
    '<section class="section wrap">'+grid([['Oficina gastronômica','Preparar receitas em grupo abre espaço para experimentar texturas, seguir etapas e participar com autonomia.','heart','sun',['https://www.instagram.com/casadoautistabetim/reel/DfAlMgmOCMr/','Ver uma oficina']],['Teatro e expressão','Apresentações e atividades culturais convidam à imaginação, à comunicação e à convivência.','spark','lilac',['https://www.instagram.com/casadoautistabetim/reel/DfR2iB0RiV4/','Ver atividade']],['Convivência e parcerias','Encontros e ações com parceiros aproximam as famílias e ampliam as experiências das crianças.','people','mint',[c.instagram,'Acompanhar no Instagram']]])+'</section>'
  ],
  '/autismo': ['Entenda o autismo','Informações sobre o espectro do autismo e as diferentes necessidades de apoio.',
    title('INFORMAÇÃO PARA FAMÍLIAS','Cada pessoa autista é única','O autismo faz parte do desenvolvimento de uma pessoa. A comunicação, a convivência e a forma de perceber o ambiente podem variar de pessoa para pessoa.')+
    '<section class="section wrap">'+grid([['Comunicação','Uma pessoa pode se comunicar pela fala, pelos gestos, por imagens ou por outros recursos. Observe como ela prefere se expressar.','chat','lilac'],['Sensibilidades e rotina','Sons, luzes e texturas podem ser percebidos de maneiras diferentes. Perguntar e observar ajuda a entender o que traz conforto.','spark','sun'],['Necessidades de apoio','As necessidades podem variar conforme a pessoa, a atividade e o ambiente. Respeitar essas diferenças faz parte do acolhimento.','heart','mint']])+'<div class="notice">'+icon('home')+'<div><h2>Tem dúvidas sobre o desenvolvimento da criança?</h2><p>A UBS de referência é o primeiro ponto de orientação para a família.</p></div>'+btn('/como-ser-atendido','Ver o passo a passo')+'</div></section>'
  ],
  '/profissionais': ['Equipe','Áreas de atuação da equipe multiprofissional da Casa dos Autistas.',
    title('CUIDADO COMPARTILHADO','Nossa equipe','Profissionais de diferentes áreas colaboram para entender as necessidades de cada criança e orientar as famílias.')+
    '<section class="section wrap">'+grid([['Comunicação e aprendizagem','Fonoaudiologia, psicopedagogia e musicoterapia.','chat','lilac'],['Movimento e autonomia','Fisioterapia, psicomotricidade e terapia ocupacional.','spark','sun'],['Acolhimento e apoio à família','Psicologia e serviço social.','people','mint']])+'<p class="source">'+a(c.instagram,'Acompanhe o trabalho da equipe no Instagram '+icon('arrow'),'text-link')+'</p></section>'
  ],
  '/ebooks': ['Materiais','Materiais gratuitos de referência para as famílias.',
    title('PARA CONSULTAR','Materiais para famílias','Orientações e leituras para entender o acesso ao atendimento e conhecer mais sobre o autismo.')+
    '<section class="section wrap">'+grid([['Guia da família','Passo a passo da UBS à regulação e checklist de documentos.','file','lilac',['/como-ser-atendido','Abrir guia']],['Linha de Cuidado Intelectual','Orientações da Prefeitura de Betim sobre o fluxo de atendimento.','file','sun',[c.city,'Consultar a Prefeitura']],['Entenda o espectro','Leia a publicação da equipe da Casa sobre diferenças na comunicação e no apoio.','file','mint',['https://www.instagram.com/casadoautistabetim/p/DaLqQYxOcNt/','Ler publicação']]])+'</section>'
  ],
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
function layout(path,[name,description,body]) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+description+'"><meta name="robots" content="noindex"><meta name="theme-color" content="#fcf9f2"><title>'+name+' | Casa dos Autistas de Betim</title><link rel="icon" href="'+media.logo+'"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="/site.css"><script type="module" src="/site.js"></script></head><body><a href="#main" class="skip">Pular para o conteúdo</a><div class="preview-note">Modelo de demonstração <a href="'+c.official+'">Ver o site atual</a></div>'+links(path)+'<main id="main">'+body+'</main>'+footer(path)+dialog+'</body></html>'
}
await mkdir('dist',{recursive:true})
await cp('public','dist',{recursive:true})
for (const doc of balanceFiles) await access('dist/documentos/'+doc.file)
await writeFile('dist/guia-chat.js','export default '+ JSON.stringify(chat))
for (const [path,page] of Object.entries(pages)) await writeFile('dist/'+(path==='/'?'index':path.slice(1))+'.html',layout(path,page))
console.log(Object.keys(pages).length+' páginas geradas.')
