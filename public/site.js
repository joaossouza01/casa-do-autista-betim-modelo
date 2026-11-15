
import chat from './guia-chat.js'

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

const dialog = document.querySelector('#family-chat')
const history = document.querySelector('#chat-history')
const actions = document.querySelector('#chat-actions')
const close = document.querySelector('#close-chat')
let launcher
function element(tag, text, className) {
  const item = document.createElement(tag)
  if (text) item.textContent = text
  if (className) item.className = className
  return item
}
function showTopic(topic, reset = false) {
  const entry = chat[topic]
  if (reset || topic === 'inicio') history.replaceChildren()
  if (entry.label) history.append(element('p', entry.label, 'chat-message user'))
  const message = element('div', '', 'chat-message')
  if (entry.step) message.append(element('span', 'Etapa ' + entry.step + ' de 3', 'chat-progress'))
  message.append(element('p', entry.text))
  if (entry.list) {
    const list = element('ul')
    list.append(...entry.list.map(item => element('li', item)))
    message.append(list)
  }
  if (entry.link) {
    const [label, href] = entry.link
    const link = element('a', label)
    link.href = href
    if (href.startsWith('/')) link.addEventListener('click', () => dialog.close())
    message.append(link)
  }
  history.append(message)
  actions.replaceChildren(...entry.options.map(key => {
    const option = element('button', chat[key].label || 'Voltar ao início')
    option.type = 'button'
    option.addEventListener('click', () => {
      showTopic(key)
      actions.firstElementChild.focus({ preventScroll: true })
      history.lastElementChild.scrollIntoView({ block: 'start' })
    })
    return option
  }))
}
document.querySelectorAll('[data-chat]').forEach(button => {
  button.addEventListener('click', () => {
    launcher = button
    if (!history.firstChild) showTopic('inicio')
    dialog.showModal()
    close.focus()
  })
})
close.addEventListener('click', () => dialog.close())
dialog.addEventListener('close', () => launcher?.focus())
document.querySelector('#restart-chat').addEventListener('click', () => {
  showTopic('inicio', true)
  actions.firstElementChild.focus()
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

    const { name, email, area } = Object.fromEntries(new FormData(resume))
    const subject = 'Candidatura — ' + area
    const text = 'Olá, gostaria de apresentar minha candidatura.\n\nNome: ' + name + '\nE-mail: ' + email + '\nÁrea: ' + area + '\n\nCurrículo em anexo.'
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