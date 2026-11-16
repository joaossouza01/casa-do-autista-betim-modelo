import { professionals, books, gallery, coordinator, story, mission, vision, values, practice, originalArtwork } from './original.mjs'
import { balanceFiles } from './content.mjs'

// Presentation changes are separate from the preserved institutional content.
export function refine(pages, { c, media, btn, a, icon, title, chip, chatBtn, stepCards }) {
  const photo = (src, alt, cls='') => `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy" decoding="async">`
  const prose = items => items.map(text=>`<p>${text}</p>`).join('')
  const aside = `<aside class="contact-aside"><span class="eyebrow">PODE CONTAR COM A CASA</span><h2>Vamos conversar?</h2><p>A equipe pode esclarecer dúvidas sobre a instituição e suas atividades.</p>${btn(c.whatsapp,'Falar com a equipe')}${a(c.telephone,c.phone,'contact-phone')}</aside>`
  const shortcuts = [
    ['/como-ser-atendido','Como ser atendido','Encaminhamento pela UBS'],
    ['/profissionais','Quem atende','Conheça a equipe da Casa'],
    ['/contato','Fale com a Casa','Telefone, WhatsApp e e-mail'],
  ]
  const routeMenu = `<nav class="family-shortcuts wrap" aria-label="Atalhos para famílias">${shortcuts.map(([href, name, description])=>a(href,`<span class="shortcut-label"><strong>${name}</strong><small>${description}</small></span>${icon('arrow')}`)).join('')}</nav>`
  pages['/'][2] = pages['/'][2].replace('</section>', '</section>'+routeMenu)
    .replace('<section class="section tinted"><div class="wrap split founder">','<section class="section founder-section"><div class="wrap split founder">')
    .replace('<section class="section tinted"><div class="wrap split"><div class="feature-image">','<section class="section everyday-section"><div class="wrap split"><div class="feature-image">')
    .replace('src="'+media.activity+'" alt="Registro de atividade na Casa"','src="'+gallery[1]+'" alt="Registro de atividade na Casa"')
  const homeGuideStart=pages['/'][2].indexOf('<section class="section wrap"><div class="section-title"><div>'+chip('PARA FAMÍLIAS'))
  if(homeGuideStart>=0) {
    const end=pages['/'][2].indexOf('</section>',homeGuideStart)+10
    pages['/'][2]=pages['/'][2].slice(0,homeGuideStart)+`<section class="section family-section"><div class="wrap family-layout"><div>${chip('PARA FAMÍLIAS')}<h2>O primeiro passo começa com orientação.</h2><p>Entenda como procurar atendimento em Betim e organize o que levar à UBS.</p><div class="actions">${btn('/como-ser-atendido','Ver passo a passo')}${chatBtn('Ainda tenho dúvida')}</div></div>${stepCards()}</div></section>`+pages['/'][2].slice(end)
  }
  pages['/quem-somos'][2]=title('NOSSA HISTÓRIA','Quem Somos','Acolhimento, aprendizado e inclusão para pessoas autistas e suas famílias.')+`<section class="section wrap about-story"><div class="editorial"><h2>Uma Casa feita de pessoas.</h2>${prose(story)}</div><figure>${photo(media.activity,'Atividade na Casa dos Autistas')}<figcaption>Encontros, aprendizado e convivência na Casa.</figcaption></figure></section><section class="section purpose-section"><div class="wrap"><div class="mission-grid"><article><h2>Missão</h2><p>${mission}</p></article><article><h2>Visão</h2><p>${vision}</p></article></div><div class="values-layout"><h2>Nossos valores</h2><dl class="values-list">${values.map(([label,desc])=>`<div><dt>${label}</dt><dd>${desc}</dd></div>`).join('')}</dl></div></div></section><section class="section wrap editorial-with-aside"><div class="editorial"><span class="eyebrow">CUIDADO INTEGRADO</span><h2>Profissionais</h2>${prose(practice)}<div class="actions">${btn('/profissionais','Conheça a equipe','secondary')}</div></div>${aside}</section>`

  // Preserve all six profiles while making the directory useful to scan.
  const specialties=[...new Set(professionals.map(p=>p.area))]
  pages['/profissionais'][2]=title('NOSSA EQUIPE','Profissionais','Conheça as pessoas e as áreas que fazem parte do cuidado na Casa dos Autistas.')+`<section class="section wrap"><div class="directory-intro"><p>Um trabalho integrado, com atenção ao ritmo e às necessidades de cada pessoa.</p><label class="team-filter" for="team-area">Área de atuação<select id="team-area"><option value="">Todas as áreas</option>${specialties.map(area=>`<option>${area}</option>`).join('')}</select></label></div><p class="visually-hidden" id="team-count" aria-live="polite">6 profissionais</p><div class="portrait-grid">${professionals.map(p=>`<article class="portrait" data-area="${p.area}"><a href="/teacher/${p.slug}"><div class="portrait-photo">${photo(p.image,p.name)}</div><div><p class="specialty">${p.role}</p><h2>${p.name}</h2><span>Conheça a atuação ${icon('arrow')}</span></div></a></article>`).join('')}</div></section>`
  pages['/teacher']=pages['/profissionais']

  pages['/contato'][2]=title('CASA DOS AUTISTAS','Contato','Escolha o canal mais confortável para conversar com a equipe.')+`<section class="section wrap contact-layout"><div class="contact-information"><span class="eyebrow">CASA DOS AUTISTAS · BETIM</span><h2>Estamos por aqui.</h2><p>A verdadeira inclusão começa com a empatia.</p><dl><div><dt>Telefone e WhatsApp</dt><dd>${a(c.telephone,c.phone)}</dd><dd>${a(c.whatsapp,'Conversar pelo WhatsApp '+icon('arrow'),'text-link')}</dd></div><div><dt>E-mail</dt><dd>${a('mailto:'+c.email,c.email)}</dd></div><div><dt>Localização</dt><dd>Rua Goiás, 219<br>Espírito Santo · Betim, MG</dd><dd>${a(c.map,'Abrir no mapa '+icon('arrow'),'text-link')}</dd></div><div><dt>Instagram</dt><dd>${a(c.instagram,'@casadoautistabetim')}</dd></div></dl><p class="small">Confirme endereço e horário com a equipe antes da visita. O endereço acima foi divulgado pela Prefeitura.</p></div><div class="contact-writing"><h2>Escreva sua mensagem</h2><p>Preencha os campos e escolha onde quer enviar a mensagem: WhatsApp ou e-mail.</p>${pages['/contato'][2].match(/<form id="contact-form"[\s\S]*?<\/form>/)?.[0]||''}<p class="form-alternate">Também é possível usar o <a href="${c.official}contato/#wpcf7-f1255-p48-o1">formulário do site original</a>.</p></div></section><section class="family-callout"><div class="wrap"><div><span class="eyebrow">ESTÁ BUSCANDO ATENDIMENTO?</span><h2>Podemos ajudar com o próximo passo.</h2></div>${btn('/como-ser-atendido','Ver orientação para famílias','secondary')}${chatBtn('Ainda tenho dúvida')}</div></section>`

  const documentRow = (year, name, file) => `<div class="document-row"><div class="document-year">${year}</div><div><span class="status-label${file?'':' pending'}">${file?'Disponível para download':'Disponível mediante solicitação'}</span><h3>${name}</h3><p>${file?'Documento institucional em PDF.':'Solicite uma cópia à equipe da Casa.'}</p></div>${file?`<a class="button secondary" href="/documentos/${encodeURIComponent(file)}" download>Baixar PDF</a>`:btn('mailto:'+c.email+'?subject='+encodeURIComponent('Solicitação de documento: '+name),'Solicitar documento','secondary')}</div>`
  const registeredBalances = new Map(balanceFiles.map(({year,file}) => [Number(year),file]))
  const balanceYears = [...new Set([2024,...registeredBalances.keys()])].sort((first,second) => first-second)
  const balances = balanceYears.map(year => documentRow(year,'Balanço Patrimonial '+year,registeredBalances.get(year))).join('')
  const declaration = documentRow(2025,'Declaração de ausência de faturamento')
  pages['/transparencia'][2] = title('INSTITUCIONAL','Transparência','Documentos da Casa, organizados por assunto e período.')+
    `<section class="section wrap editorial-with-aside"><div class="document-register"><h2>Documentos institucionais</h2>${balances}${declaration}</div>${aside}</section>`

  // Provide section links in the family guide without converting it into a form.
  pages['/como-ser-atendido'][2]=pages['/como-ser-atendido'][2].replace('</section>','</section><nav class="guide-nav wrap" aria-label="Neste guia"><a href="#etapas">Passo a passo</a><a href="#documentos">Documentos</a><a href="#duvidas">Dúvidas frequentes</a><button type="button" data-print>Imprimir orientação</button></nav>').replace('<section class="section wrap">','<section id="etapas" class="section wrap">').replace('<section class="section wrap narrow"><h2>Perguntas frequentes</h2>','<section id="duvidas" class="section wrap narrow"><h2>Perguntas frequentes</h2>')

  // Preserve original CV fields, grouping optional data instead of making a long wall of inputs.
  pages['/trabalhe-conosco'][2]=pages['/trabalhe-conosco'][2].replace('<form class="card resume"','<form class="card resume application-form"').replace('<div class="field-row">','<details class="optional-fields"><summary>Informações complementares (opcional)</summary><div class="field-row">').replace('</fieldset>','</fieldset></details>').replace('<div class="field"><label for="cv">','<div class="field upload-field"><label for="cv">').replace('<h2>Envie seu currículo</h2>','<h2>Seu trabalho pode fazer parte dessa história.</h2><p class="application-kicker">Apresente sua experiência à Casa.</p>')

  pages['/contato'][2]=pages['/contato'][2].replace('<form id="contact-form"','<form method="post" id="contact-form"')
  pages['/trabalhe-conosco'][2]=pages['/trabalhe-conosco'][2].replace('</form>', '<p class="form-alternate">Para entrar em contato sem anexar um PDF, use o <a href="'+c.official+'trabalhe-conosco/#wpcf7-f1192-p46-o1">formulário do site original</a>.</p></form>')

  pages['/oficinas'][2]=title('A CASA NO DIA A DIA','Oficinas e convivência','Espaço para experimentar, se expressar e participar no próprio ritmo.')+`<section class="section wrap activity-editorial">${[
    ['Oficina gastronômica','Preparar receitas em grupo abre espaço para experimentar texturas, seguir etapas e participar com autonomia.','https://www.instagram.com/casadoautistabetim/reel/DfAlMgmOCMr/','Ver uma oficina'],
    ['Teatro e expressão','Apresentações e atividades culturais convidam à imaginação, à comunicação e à convivência.','https://www.instagram.com/casadoautistabetim/reel/DfR2iB0RiV4/','Ver atividade'],
    ['Convivência e parcerias','Encontros e ações com parceiros aproximam as famílias e ampliam as experiências das crianças.',c.instagram,'Acompanhar no Instagram'],
  ].map(([heading,text,url,label],i)=>`<article><span class="activity-number" aria-hidden="true">${icon(['heart','spark','people'][i])}</span><div><h2>${heading}</h2><p>${text}</p>${a(url,label+' '+icon('arrow'),'text-link')}</div></article>`).join('')}<figure class="activity-record">${photo(gallery[2],'Registro da Casa dos Autistas publicado no site original')}<figcaption>Um registro da Casa. Mais atividades no Instagram da instituição.</figcaption></figure></section>`
}
