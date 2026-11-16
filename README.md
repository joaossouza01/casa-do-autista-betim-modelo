
# Casa dos Autistas de Betim

## Revisar o agendamento de visitas

O botão **Conhecer a Casa** no guia virtual fica separado do percurso de atendimento pelo SUS.
Sem configuração extra, ele abre uma conversa no WhatsApp da Casa com a mensagem pronta para a pessoa revisar e enviar.

Para mostrar horários de visita, crie um **Agendamento de horários** na conta institucional do Google Agenda, configure os períodos autorizados pela equipe e copie o link público dessa página. Configure o endereço na variável `GOOGLE_VISIT_BOOKING_URL` na Vercel e gere um novo deploy. O site incorpora apenas o link público. A escolha e confirmação do horário acontecem no Google.

O build aceita links curtos `calendar.app.google` e páginas de reserva `calendar.google.com/calendar/appointments/`. Se a variável ficar vazia, o WhatsApp continua disponível. Use a configuração de reserva só para visitas e mantenha o encaminhamento do atendimento pela UBS.

Modelo do site institucional com páginas estáticas, guia de acesso pela UBS e chat de respostas predefinidas. O projeto não usa IA, banco de dados ou dependências externas de JavaScript.

## Rodar

- Use Node.js 20 ou mais recente.
- Execute `npm run dev` e abra `http://127.0.0.1:4380`.
- Execute `npm run check` para gerar as páginas e verificar links internos e opções do chat.

## Conteúdo e publicação

- `content.mjs` guarda contatos, fontes, etapas, documentos orientativos e o fluxo do chat.
- `build.mjs` gera as páginas em `dist`. A Vercel usa `npm run build` com saída em `dist`.
- Para publicar um balanço, coloque o PDF oficial em `public/documentos/` e registre o ano e o nome do arquivo em `balanceFiles` dentro de `content.mjs`. O build verifica a existência do arquivo.
- O formulário gera um rascunho .eml com o PDF anexado no navegador, além da opção de abrir um e-mail e anexar manualmente. O candidato envia a mensagem pelo cliente de e-mail. Não há armazenamento ou envio automático de currículos.
- Revise os documentos exigidos pela Casa e a localização com a equipe antes de substituir o site oficial. O guia referencia o fluxo municipal e indica a confirmação na UBS.
- A demonstração está sinalizada e usa noindex. Após aprovação para publicação oficial, revise o aviso na página, o rodapé e o noindex no HTML e na configuração da Vercel.
