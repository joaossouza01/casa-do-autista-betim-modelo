
import { facts, documents, resources } from './guia-chat.js'

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const no = /^(nao|ainda nao|nunca|negativo)\b/
const yes = /^(sim|ja|tenho|pode|claro|quero)\b/
const uncertain = /\b(nao sei|nao lembro|nao tenho certeza|talvez|acho que|em duvida)\b/
const stages = {
  name: { label:'Apresentação', number:0, hint:'Digite seu primeiro nome' },
  start: { label:'Entender sua situação', number:1, hint:'Conte em que ponto você está…', question:'Você já procurou a UBS por causa do desenvolvimento da criança ou ainda vai começar?' },
  referral: { label:'Entender sua situação', number:1, hint:'Responda do seu jeito…', question:'Na UBS, a equipe chegou a registrar um encaminhamento para atendimento especializado?' },
  reports: { label:'Preparar o próximo passo', number:2, hint:'Conte se você tem algum documento…', question:'Você já tem algum laudo, relatório ou encaminhamento anterior, mesmo que de outro serviço?' },
  status: { label:'Preparar o próximo passo', number:2, hint:'Digite sua resposta…', question:'Você já recebeu alguma informação sobre agendamento ou ainda está aguardando retorno?' },
  finish: { label:'Próximo passo e dúvidas', number:3, hint:'Escreva sua dúvida…', question:'O que ainda ficou em dúvida?' },
}
const topics = [
  [/\b(urgencia|emergencia|upa|pronto atendimento)\b/, () => ({text:facts.upa,link:resources.upa})],
  [/\b(documentos?|cartao|identidade|cpf|comprovante|levar)\b/, () => ({text:'Para se preparar para a UBS, separe os itens abaixo, se tiver. Confirme na unidade quais documentos ela solicita no seu caso.',list:documents,link:resources.checklist})],
  [/\b(laudo|diagnostico|relatorio)\b/, () => ({text:facts.laudo,link:resources.checklist})],
  [/\b(prazo|fila|espera|demora|quanto tempo|acompanhar|protocolo)\b/, () => ({text:facts.wait,link:resources.guide})],
  [/\b(garantida|garante|matricula|inscricao|vaga)\b/, () => ({text:facts.vaga,link:resources.guide})],
  [/\b(whatsapp|telefone|contato|equipe|endereco|horario)\b/, () => ({text:facts.contato,link:resources.whatsapp})],
  [/\b(ubs|posto|regulacao|sus|encaminhamento)\b/, () => ({text:facts.ubs,link:resources.guide})],
]
function topicFor(value) {
  return topics.find(([pattern])=>pattern.test(value))?.[1]()
}
function next(stage, text, name) {
  const value = normalize(text)
  const question = text.endsWith('?') || /^(quais?|quanto|quando|como|onde|preciso|posso|devo|o que|qual)\b/.test(value)
  if (question && topicFor(value)) return { stage, ...topicFor(value), resume:true }
  const waitText = { stage:'finish',text:'Seu próximo passo, '+name+', é confirmar na UBS se a solicitação está registrada e manter seu telefone atualizado. A Regulação organiza os agendamentos conforme o protocolo e a disponibilidade.',link:resources.guide }
  if (stage==='start') {
    if (/\b(ja tenho encaminhamento|fui encaminhad[oa]|aguardando|na fila|na regulacao)\b/.test(value)) return {stage:'status',text:'Entendi, '+name+'. Vamos ver como acompanhar essa solicitação.'}
    if (/\b(nada|nenhum|comecar|primeira vez|do zero|nao fui|nunca fui)\b/.test(value) || no.test(value) || uncertain.test(value)) return {stage:'reports',text:'Tudo bem, '+name+'. O primeiro passo é procurar a UBS do seu endereço e conversar com a equipe de Saúde da Família.'}
    if (yes.test(value) || /\b(fui|procurei|passei|estive|atendid[oa])\b/.test(value)) return {stage:'referral',text:'Entendi, '+name+'. A UBS é quem avalia e registra a solicitação quando a atenção especializada é indicada.'}
  }
  if (stage==='referral') {
    if (uncertain.test(value)) return {stage:'finish',text:'Nesse caso, '+name+', confirme na sua UBS se a solicitação já foi registrada. Aproveite para conferir se a equipe tem seu telefone atualizado.',link:resources.guide}
    if (no.test(value) || /\b(ainda falta|so triagem|so consulta|avaliacao)\b/.test(value)) return {stage:'reports',text:'A equipe da UBS pode orientar sobre a avaliação e o que levar no próximo retorno.'}
    if (yes.test(value) || /\b(encaminhad[oa]|registro|registrou|na fila|aguardando)\b/.test(value)) return {stage:'status',text:'Certo, '+name+'. A Regulação do SUS de Betim organiza os agendamentos.'}
  }
  if (stage==='reports' && (no.test(value)||yes.test(value)||uncertain.test(value)||/\b(laudo|relatorio|documento|encaminhamento)\b/.test(value))) {
    return {stage:'finish',text:no.test(value)||uncertain.test(value)?'Você pode procurar a UBS mesmo sem laudo, '+name+'. Se tiver outros registros sobre o desenvolvimento da criança, leve no dia.':'Leve os registros que você já tiver à UBS, '+name+'. O material ajuda a equipe a entender o que já foi avaliado.',list:documents,link:resources.checklist}
  }
  if (stage==='status') {
    if (uncertain.test(value)||no.test(value)||/\b(ainda|aguardando|espera|fila)\b/.test(value)) return waitText
    if (yes.test(value)||/\b(agendad[oa]|marcad[oa]|recebi|ligaram|confirmaram)\b/.test(value)) return {stage:'finish',text:'Ótimo, '+name+'. Siga a orientação recebida no agendamento. Se ficou faltando endereço, horário ou documentos específicos, confirme com o serviço que entrou em contato ou com a sua UBS.',link:resources.guide}
  }
  if (topicFor(value)) return {stage,...topicFor(value),resume:stage!=='finish'}
  if (stage==='finish' && /\b(obrigad[oa]|valeu|tchau|resolvi|nao tenho mais)\b/.test(value)) return {stage,text:'Por nada, '+name+'. Espero que a próxima etapa fique mais clara. Se precisar, pode voltar e escrever outra pergunta.'}
  if (stage==='finish') return {stage,text:'Não consegui identificar essa dúvida, '+name+'. Pode me perguntar sobre documentos, laudo, UBS, UPA ou encaminhamento. Para uma situação específica, fale com a equipe da Casa.',link:resources.whatsapp}
  if (stage==='start') return {stage,text:'Para eu te orientar melhor, '+name+', conte se você vai começar agora, se já passou pela UBS ou se está aguardando encaminhamento.',resume:true}
  return {stage,text:'Não entendi em que ponto você está, '+name+'. Tente escrever o que aconteceu na UBS ou responda à pergunta abaixo.',resume:true}
}

const dialog = document.querySelector('#family-chat')
const history = document.querySelector('#chat-history')
const stream = document.querySelector('.chat-stream')
const close = document.querySelector('#close-chat')
const form = document.querySelector('#chat-form')
const input = document.querySelector('#chat-input')
const submit = form.querySelector('button')
const status = document.querySelector('#chat-stage')
const meter = document.querySelector('.chat-meter')
const restart = document.querySelector('#restart-chat')
let stage = 'name'
let name = ''
let launcher
let timer
let messages = 0

function el(tag, text='', className='') {
  const node = document.createElement(tag)
  node.textContent = text
  node.className = className
  return node
}
function append(entry, speaker='guide') {
  if (messages>=80) history.firstElementChild?.remove()
  else messages++
  const bubble = el('div','','chat-message '+speaker)
  bubble.append(el('span',speaker==='guide'?'Guia da Casa':'Você','chat-speaker'),el('p',entry.text))
  if (entry.list) {
    const list = el('ul')
    list.append(...entry.list.map(item=>el('li',item)))
    bubble.append(list)
  }
  if (entry.link) {
    const link = el('a',entry.link[0],'chat-related')
    link.href = entry.link[1]
    if (link.getAttribute('href').startsWith('/')) link.addEventListener('click',()=>dialog.close())
    bubble.append(link)
  }
  history.append(bubble)
  stream.scrollTop = stream.scrollHeight
}
function setStage(value) {
  stage = value
  const data = stages[value]
  status.textContent = data.number ? 'Etapa '+data.number+' de 3 · '+data.label : data.label
  input.placeholder = data.hint
  for (const [i,bar] of [...meter.children].entries()) bar.classList.toggle('is-active',i<data.number)
}
function reset() {
  clearTimeout(timer)
  messages = 0
  history.replaceChildren()
  name = ''
  input.value = ''
  submit.disabled = false
  setStage('name')
  append({text:'Oi! Eu sou o guia da Casa dos Autistas. Vamos descobrir juntos por onde começar em Betim. Como posso te chamar?'})
}
function reply(entry) {
  submit.disabled = true
  const typing = el('div','Guia da Casa está respondendo…','chat-typing')
  history.append(typing)
  stream.scrollTop = stream.scrollHeight
  timer = setTimeout(()=>{
    typing.remove()
    const changed = stage!==entry.stage
    setStage(entry.stage)
    append(entry)
    if (changed || entry.resume) append({text:stages[stage].question})
    submit.disabled = false
  },320)
}
function readName(value) {
  const candidate = value.replace(/^(?:oi[,.! ]+)?(?:meu nome (?:é|e)|me chamo|pode me chamar de|sou|eu sou)\s+/i,'').trim()
  if (!/^[\p{L}][\p{L}\p{M}'’ -]{0,44}$/u.test(candidate) || candidate.split(/\s+/).length>5 || /\b(ajuda|documentos|atendimento|ubs|upa|whatsapp|laudo|vaga|ola|oi)\b/.test(normalize(candidate))) return ''
  return candidate
}
form.addEventListener('submit',event=>{
  event.preventDefault()
  const value = input.value.trim()
  if (!value || submit.disabled) return
  input.value = ''
  input.focus()
  append({text:value},'user')
  if (stage==='name') {
    if (normalize(value)==='pular') {
      name = 'família'
      reply({stage:'start',text:'Tudo bem! Vamos entender em que etapa você está.'})
      return
    }
    name = readName(value)
    reply(name ? {stage:'start',text:'Prazer, '+name+'! Vou fazer algumas perguntas rápidas para encontrar o próximo passo.'} :
      {stage:'name',text:'Pode escrever só como você quer ser chamado, por exemplo, Ana. Se preferir, digite “pular”.'})
    return
  }
  reply(next(stage,value,name))
})
document.querySelectorAll('[data-chat]').forEach(button=>{
  button.addEventListener('click',()=>{
    launcher = button
    if (!history.firstChild) reset()
    dialog.showModal()
    input.focus()
    stream.scrollTop = stream.scrollHeight
  })
})
close.addEventListener('click',()=>dialog.close())
dialog.addEventListener('close',()=>launcher?.focus())
restart.addEventListener('click',()=>{reset();input.focus()})
