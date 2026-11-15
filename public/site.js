

const menu = document.querySelector('.menu-toggle')
menu.addEventListener('click', () => {
  const open = document.querySelector('#site-nav').classList.toggle('open')
  menu.setAttribute('aria-expanded', String(open))
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    document.querySelector('#site-nav').classList.remove('open')
    menu.setAttribute('aria-expanded', 'false')
    menu.focus()
  }
})

const resume = document.querySelector('#resume-form')
if (resume) {
  const fileInput = resume.elements.cv
  const fileMessage = document.querySelector('#file-message')
  const confirmation = document.querySelector('#resume-confirmation')
  const draft = document.querySelector('#resume-draft')
  let draftUrl
  let revision = 0

  function clearDraft() {
    revision++
    confirmation.hidden = true
    if (draftUrl) URL.revokeObjectURL(draftUrl)
    draftUrl = undefined
    draft.removeAttribute('href')
  }
  async function validPdf(file) {
    return file && file.size > 5 && file.size <= 5 * 1024 * 1024 &&
      /\.pdf$/i.test(file.name) && await file.slice(0, 5).text() === '%PDF-'
  }
  function asBase64(bytes) {
    const chunks = []
    for (let offset = 0; offset < bytes.length; offset += 16384) {
      chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 16384)))
    }
    return btoa(chunks.join(''))
  }
  function wrapBase64(data) {
    return data.match(/.{1,76}/g).join('\r\n')
  }
  function createDraft(recipient, subject, text, pdfBytes) {
    const encode = value => asBase64(new TextEncoder().encode(value))
    const boundary = 'casa-autistas-' + crypto.randomUUID()
    const foldedSubject = subject.match(/.{1,12}/gu).map(part => '=?UTF-8?B?' + encode(part) + '?=').join('\r\n ')
    return new Blob([[
      'To: ' + recipient,
      'Subject: ' + foldedSubject,
      'X-Unsent: 1',
      'MIME-Version: 1.0',
      'Content-Type: multipart/mixed; boundary="' + boundary + '"',
      '',
      '--' + boundary,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrapBase64(encode(text)),
      '',
      '--' + boundary,
      'Content-Type: application/pdf; name="curriculo.pdf"',
      'Content-Disposition: attachment; filename="curriculo.pdf"',
      'Content-Transfer-Encoding: base64',
      '',
      wrapBase64(asBase64(new Uint8Array(pdfBytes))),
      '',
      '--' + boundary + '--',
      '',
    ].join('\r\n')], {type:'message/rfc822'})
  }
  resume.addEventListener('input', clearDraft)
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0]
    fileInput.setCustomValidity('')
    if (!file) {
      fileMessage.textContent = 'Selecione um arquivo do seu dispositivo.'
      return
    }
    const error = file.size > 5 * 1024 * 1024 ? 'Selecione um PDF de até 5 MB.' : 'Selecione um arquivo PDF válido.'
    const valid = await validPdf(file)
    if (fileInput.files[0] !== file) return
    fileInput.setCustomValidity(valid ? '' : error)
    fileMessage.textContent = valid ? 'PDF selecionado: ' + file.name : error
  })
  resume.addEventListener('submit', async event => {
    event.preventDefault()
    clearDraft()
    const attempt = revision
    const file = fileInput.files[0]
    if (!await validPdf(file) || attempt !== revision) return

    const { name, email, area, birth, phone, address, instagram, facebook } = Object.fromEntries(new FormData(resume))
    const subject = 'Candidatura — ' + area
    const details = [['Nome',name],['E-mail',email],['Área',area],['Data de nascimento',birth],['Telefone',phone],['Endereço',address],['Instagram',instagram],['Facebook',facebook]].filter(([,value])=>value).map(([label,value])=>label+': '+value)
    const text = ['Olá, gostaria de apresentar minha candidatura.','',...details,'','Currículo em anexo.'].join('\n')
    const mail = document.querySelector('#resume-mail')
    const bytes = await file.arrayBuffer()
    if (attempt !== revision) return

    draftUrl = URL.createObjectURL(createDraft(resume.dataset.recipient, subject, text, bytes))
    draft.href = draftUrl
    mail.href = 'mailto:' + resume.dataset.recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text)
    confirmation.hidden = false
    draft.focus()
  })
}


const contactForm = document.querySelector('#contact-form')
if (contactForm) {
  const link=document.querySelector('#contact-mail')
  contactForm.addEventListener('input',()=>{link.hidden=true})
  contactForm.addEventListener('submit',event=>{
    event.preventDefault()
    const {name,email,phone,subject,message}=Object.fromEntries(new FormData(contactForm))
    const body=['Nome: '+name,'E-mail: '+email,'Telefone: '+phone,'',message].join('\n')
    link.href='mailto:'+contactForm.dataset.recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)
    link.hidden=false
    link.focus()
  })
}

const searchForm=document.querySelector('#search-form')
if (searchForm) {
  const results=document.querySelector('#search-results')
  const status=document.querySelector('#search-status')
  const simplify=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  let index
  let searchRequest=0
  searchForm.addEventListener('submit',async event=>{
    event.preventDefault()
    const id=++searchRequest
    const query=simplify(searchForm.elements.q.value.trim()).split(/\s+/).filter(Boolean)
    if (!query.length) return
    results.replaceChildren()
    status.textContent='Buscando…'
    try {
      if (!index) {
        const response=await fetch('/search-index.json')
        if (!response.ok) throw new Error('Busca indisponível')
        index=await response.json()
      }
      if (id!==searchRequest) return
      const matches=index.map(entry=>{
        const title=simplify(entry.title)
        const data=simplify(entry.title+' '+entry.desc+' '+entry.text)
        return {entry,score:query.every(term=>data.includes(term))?query.reduce((score,term)=>score+(title.includes(term)?5:1),0):0}
      }).filter(item=>item.score).sort((a,b)=>b.score-a.score)
      status.textContent=matches.length?matches.length+' resultado(s)':'Nenhum resultado. Tente outra palavra.'
      for (const {entry} of matches) {
        const li=document.createElement('li')
        const link=document.createElement('a')
        link.href=entry.path
        link.textContent=entry.title
        const desc=document.createElement('p')
        desc.textContent=entry.desc
        li.append(link,desc)
        results.append(li)
      }
    } catch {
      if (id===searchRequest) status.textContent='Busca indisponível no momento.'
    }
  })
}
