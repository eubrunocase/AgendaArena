# AgendaArena MVP: especificação para o agente de implementação

Este arquivo é a **única fonte de verdade** do projeto. Leia-o inteiro antes de escrever código.

## 0. Regras para o agente

1. Implemente **somente o que está descrito aqui**. Não adicione telas, campos, bibliotecas ou recursos extras. Se algo estiver ambíguo, escolha a opção mais simples que respeite as regras de negócio e registre a decisão no `README.md`.
2. O projeto é uma **página estática em Angular, sem backend e sem banco de dados**. Não use Firebase, Supabase, APIs, `HttpClient` nem qualquer serviço externo. Os dados vivem no próprio navegador (seção 6).
3. O app existe para **demonstração**: todas as telas e fluxos (RF01 a RF10) precisam funcionar de ponta a ponta contra os dados locais, e o site precisa estar publicado no GitHub Pages.
4. Todo texto visível ao usuário está em **português do Brasil**.
5. Código limpo e simples. Comentários só onde algo realmente não for óbvio.
6. Não use imagens externas (fotos de arena, avatares). Use cores, gradientes e ícones.
7. Ao terminar, rode o checklist da seção 12 e o build de produção. Corrija qualquer erro antes de entregar.

## 1. Contexto

**AgendaArena** é um aplicativo web de reserva de quadras para pequenas arenas de society em Salvador (BA). Substitui o controle por WhatsApp e caderno por uma agenda online.

- **Jogador:** consulta horários livres, solicita reserva, acompanha o status e cancela.
- **Gestor da arena:** cadastra arena e quadras, define horários, bloqueia horários, publica a agenda, aprova ou recusa solicitações e vê as reservas do dia.

O projeto é a atividade semestral de Processos de Negócios (UCSAL). Esta entrega é uma **demonstração navegável**: as telas projetadas no Stitch, funcionando com dados de exemplo, que refletem os processos, regras e requisitos já documentados.

## 2. Escopo

### Dentro do MVP
Telas T01 a T09 (e T03b) com navegação completa, login e cadastro simulados, cadastro de arena e quadras, definição e publicação da agenda, bloqueio de horários, consulta de horários, solicitação de reserva, aprovação ou recusa pelo gestor, aviso do resultado dentro do app, cancelamento com prazo mínimo e painel de reservas do dia. Tudo funcionando sobre dados locais, com dados de exemplo já carregados.

### Fora do MVP (não implementar)
- **Backend, banco de dados, API, autenticação real e sincronização entre aparelhos.**
- Pagamento online (o pagamento seria feito na própria arena).
- Notificações por WhatsApp, e-mail ou push.
- Login com Google ou WhatsApp e recuperação de senha.
- Compartilhar reserva ou grade, comprovante, reservas mensalistas, sinal, avaliações, clima, estrutura da quadra, fotos.
- Tela de perfil, upload de arquivos, chat, relatórios.

> O protótipo do Stitch (seção 10) mostra alguns desses itens. **Ignore-os.**

## 3. Stack e decisões técnicas

| Item | Decisão |
|---|---|
| Framework | **Angular**, versão estável mais recente (`npx @angular/cli@latest new agendaarena`) |
| Estrutura | Componentes **standalone**, **signals** para estado, controle de fluxo novo (`@if`, `@for`), `inject()` |
| Estilo | **Tailwind CSS** (integração oficial com o Angular) e tokens de cor da seção 10 |
| Roteamento | `provideRouter(routes, withHashLocation())`. A hash evita erro 404 ao recarregar no GitHub Pages |
| Dados | Um **store único** (`DemoStore`) com signals, em memória, **persistido no `localStorage`** para sobreviver a recarregamentos. Sem backend |
| Ícones e fonte | Google Fonts: **Inter** e **Material Symbols Outlined**, no `index.html` |
| Datas | Sempre horário local. Datas em texto `YYYY-MM-DD`, horas em `HH:mm`. Nunca converta para UTC |
| Testes | Executor que vem com o CLI. Testes unitários para a geração de horários, a regra de cancelamento e o store (seção 12) |

## 4. Ações do humano

1. Criar o repositório no GitHub e enviar o código.
2. Em **GitHub > Settings > Pages > Source**, escolher **GitHub Actions**.
3. Copiar a pasta do protótipo do Stitch para `referencias/stitch/` (somente consulta, fora do build).

## 5. Estrutura do projeto

```
src/app/
  core/
    models.ts                # interfaces (seção 6.1)
    dados-demo.ts            # função que gera os dados de exemplo (seção 6.3)
    demo-store.service.ts    # estado, persistência e todas as operações (seção 6.2)
    auth.service.ts          # sessão simulada, cadastro, login, logout
    guards.ts                # autenticado, perfil jogador, perfil gestor
    agenda.util.ts           # geração de horários e estados (seção 9)
    datas.util.ts            # helpers de data local e rótulos em pt-BR
  shared/
    header, bottom-nav, toast (serviço + componente), modal,
    chip-status, estado-vazio, seletor-data
  features/
    auth/login
    jogador/agenda, reserva-nova, reserva-enviada, minhas-reservas
    gestor/solicitacoes, reservas-dia, arena, horarios
  app.routes.ts
referencias/stitch/          # protótipo (não entra no build)
.github/workflows/deploy.yml
README.md
```

## 6. Dados locais

### 6.1 Modelos (`models.ts`)

| Entidade | Campos |
|---|---|
| `Usuario` | `id`, `nome`, `email`, `senha` (texto simples; é só demonstração), `perfil` (`'jogador'` ou `'gestor'`) |
| `Arena` | `id`, `gestorId`, `nome`, `bairro`, `telefone`, `prazoCancelamentoHoras` (número, padrão 24), `publicada` (boolean, padrão false) |
| `Quadra` | `id`, `arenaId`, `nome`, `tipo` (`'Society'`, `'Futsal'` ou `'Areia'`), `diasSemana` (números 0 a 6, 0 = domingo), `abertura` (`HH:mm`), `fechamento` (`HH:mm`), `duracaoMin` (60, 90 ou 120), `valor` (número) |
| `Bloqueio` | `quadraId`, `data`, `hora`, `motivo` |
| `Reserva` | `id`, `arenaId`, `arenaNome`, `quadraId`, `quadraNome`, `jogadorId`, `jogadorNome`, `data`, `horaInicio`, `horaFim`, `valor`, `observacao`, `status`, `avisoVisto` (boolean), `comparecimento` (boolean ou null), `criadaEm` (milissegundos), `atualizadaEm` (milissegundos) |

- Status da reserva: `Pendente`, `Confirmada`, `Recusada`, `Cancelada`.
- Uma reserva está **ativa** quando o status é `Pendente` ou `Confirmada`. Só reservas ativas ocupam o horário (RN01).
- A **chave do horário** é `${quadraId}_${data}_${hora}`.
- Cada gestor tem no máximo uma arena.
- Padrões ao criar uma quadra: `diasSemana` = `[0,1,2,3,4,5,6]`, `abertura` = `17:00`, `fechamento` = `23:00`, `duracaoMin` = 60, `valor` = 120.

### 6.2 Store (`DemoStore`)

- Guarda signals para `usuarios`, `arenas`, `quadras`, `bloqueios`, `reservas` e `sessaoUsuarioId`.
- A cada mudança, grava tudo em uma única chave do `localStorage` (`agendaarena.demo.v1`). Na inicialização, lê essa chave; se não existir (ou for inválida), carrega os dados de exemplo (seção 6.3).
- Expõe `restaurarDemo()`, que apaga a chave e recarrega os dados de exemplo a partir da data de hoje.
- Operações (todas síncronas, sem `async`), que implementam as regras de negócio da seção 7:
  - `cadastrarUsuario`, `entrar`, `sair`
  - `salvarArena`, `salvarQuadra`, `excluirQuadra`, `publicarAgenda`
  - `bloquearHorario`, `liberarHorario`
  - `criarReserva`, `aprovarReserva`, `recusarReserva`, `cancelarReserva`
  - `marcarComparecimento`, `marcarAvisoVisto`
- As telas leem o estado por signals (`computed`), então qualquer alteração aparece **na hora** nas outras telas.

### 6.3 Dados de exemplo (`dados-demo.ts`)

Função `criarDadosDemo(hoje: Date)`. Todas as datas são relativas a **hoje** (`hoje+1` = amanhã). Nomes são fictícios.

**Usuários**

| Nome | E-mail | Senha | Perfil |
|---|---|---|---|
| Marcos Oliveira | `gestor@agendaarena.demo` | `123456` | gestor |
| Carlos Silva | `jogador@agendaarena.demo` | `123456` | jogador |
| Rafael Menezes, Marcos Lima, Ana Souza | sem login | (nenhuma) | jogador |

Rafael, Marcos Lima e Ana existem só como autores das reservas de exemplo. Não é possível entrar com eles.

**Arena do Marcos Oliveira:** “Arena Boa Bola”, bairro “Pituba, Salvador”, telefone “(71) 98765-4321”, prazo de cancelamento 24 h, `publicada = true`.

**Quadras:** “Quadra 1” (Society, valor 120) e “Quadra 2” (Society, valor 110). Ambas abrem das 18:00 às 23:00, com horários de 60 min, todos os dias.

**Bloqueio:** Quadra 1, `hoje+1`, 22:00, motivo “Manutenção dos refletores”.

**Reservas**

| Quadra | Dia | Hora | Jogador | Status | Observação |
|---|---|---|---|---|---|
| Quadra 1 | hoje | 19:00 | Marcos Lima | Confirmada | Turma do Sextou FC |
| Quadra 1 | hoje | 21:00 | Rafael Menezes | Confirmada | Baba dos Amigos da Pituba |
| Quadra 2 | hoje | 20:00 | Ana Souza | Confirmada | Veteranos do Imbuí |
| Quadra 1 | hoje+3 | 20:00 | Carlos Silva | Confirmada (`avisoVisto = false`) | |
| Quadra 1 | hoje-6 | 19:00 | Carlos Silva | Confirmada (passada) | |
| Quadra 1 | hoje+1 | 20:00 | Rafael Menezes | Pendente (criada há 10 min) | Baba semanal dos amigos, levaremos 2 bolas |
| Quadra 2 | hoje+2 | 18:00 | Marcos Lima | Pendente (criada há 25 min) | |
| Quadra 1 | hoje+3 | 21:00 | Ana Souza | Pendente (criada há 40 min) | |
| Quadra 2 | hoje+5 | 19:00 | Carlos Silva | Pendente | |
| Quadra 2 | hoje-2 | 20:00 | Carlos Silva | Recusada | |
| Quadra 1 | hoje-4 | 20:00 | Carlos Silva | Cancelada | |

Valor de cada reserva: o da quadra. Reservas `Confirmada` e `Pendente` sem `avisoVisto` explícito começam com `avisoVisto = true` (só a de `hoje+3` do Carlos começa com `false`). `comparecimento = null`.

## 7. Regras de negócio e onde implementar

| Código | Regra | Implementação |
|---|---|---|
| RN01 | Uma quadra não pode ter duas reservas ativas (Pendente ou Confirmada) no mesmo horário | `criarReserva` recusa se já houver reserva ativa com a mesma chave de horário (mensagem “Este horário acabou de ser ocupado”). Na agenda, horários ocupados ficam desabilitados |
| RN02 | Somente o gestor da arena confirma, recusa ou bloqueia horários da própria arena | Guard de perfil nas rotas do gestor. O gestor só enxerga e altera os dados da arena dele (filtro por `gestorId`) |
| RN03 | Toda solicitação nasce `Pendente` e só vira `Confirmada` com aprovação do gestor | `criarReserva` grava `status: 'Pendente'`. Somente `aprovarReserva` (tela T06) muda para `Confirmada` |
| RN04 | O jogador só cancela até um prazo mínimo antes do horário, definido pela arena (padrão 24 h) | Campo `prazoCancelamentoHoras` na arena (formulário T08). A tela T05 calcula as horas até o início e libera ou nega o cancelamento |
| RN05 | Horários bloqueados pelo gestor não aparecem como disponíveis | Itens em `bloqueios`. O estado do horário vira “Bloqueado” |
| RN06 | Recusa ou cancelamento libera o horário na hora | Ao mudar o status para `Recusada` ou `Cancelada`, a reserva deixa de ser ativa e o horário volta a ficar livre |
| RN07 | Para solicitar ou cancelar, o jogador precisa estar cadastrado e autenticado | Guard de autenticação em todas as rotas, exceto `/login` |
| RN08 | Toda reserva registra jogador, quadra, data, horário inicial e final e status | Campos de `Reserva` (seção 6.1) |

## 8. Requisitos

| Código | Requisito | Telas |
|---|---|---|
| RF01 | Cadastro e login com perfil de jogador ou gestor (simulados) | T01 |
| RF02 | Cadastro de arena e de suas quadras | T08 |
| RF03 | Horários de funcionamento, duração do horário e valor por quadra | T09 |
| RF04 | Bloqueio de horários pelo gestor | T09 (e T07) |
| RF05 | Consulta de horários disponíveis por quadra e data | T02 |
| RF06 | Solicitação de reserva com status inicial Pendente | T03, T03b |
| RF07 | Análise das solicitações (confirmar ou recusar) | T06 |
| RF08 | Aviso do resultado ao jogador, pelo status em “Minhas reservas” | T04 |
| RF09 | Cancelamento pelo jogador, respeitando o prazo | T04, T05 |
| RF10 | Painel “Reservas do dia” para o gestor | T07 |
| RNF01 | Interface responsiva, usável pelo celular | Todas |
| RNF02 | Fluxo de reserva com poucos passos: dia, horário, “Solicitar reserva”, “Enviar solicitação” (4 toques) | T02, T03 |
| RNF03 | Acesso restrito por perfil | Guards |
| RNF04 | Aplicação publicada online e acessível por link | GitHub Pages |

## 9. Telas, rotas e comportamento

Rotas (com hash). Redirecionamentos: sem sessão vai para `/login`; com sessão, `/` vai para `/agenda` (jogador) ou `/gestor/solicitacoes` (gestor). Um perfil que acessa rota do outro é redirecionado para a sua página inicial.

| Tela | Rota | Perfil |
|---|---|---|
| T01 Login e cadastro | `/login` | público |
| T02 Agenda de horários | `/agenda` | jogador |
| T03 Solicitar reserva | `/reserva/nova?arena=&quadra=&data=&hora=` | jogador |
| T03b Solicitação enviada | `/reserva/enviada/:id` | jogador |
| T04 Minhas reservas (com T05 em modal) | `/minhas-reservas` | jogador |
| T06 Solicitações pendentes | `/gestor/solicitacoes` | gestor |
| T07 Reservas do dia | `/gestor/reservas-do-dia` | gestor |
| T08 Arena e quadras | `/gestor/arena` | gestor |
| T09 Horários e bloqueios | `/gestor/horarios` | gestor |

**Cabeçalho (todas as telas logadas):** logotipo “AgendaArena” e um botão de usuário que abre um menu simples com o nome, o perfil e as ações **“Restaurar dados de demonstração”** (pede confirmação, executa `restaurarDemo()` e leva ao início do perfil) e **“Sair”**.

**Navegação inferior fixa:**
- Jogador: **Agenda** e **Minhas reservas**.
- Gestor: **Solicitações** (com contador de pendentes), **Reservas do dia**, **Quadras** (T08) e **Horários** (T09).

### T01 · Login e cadastro
- Abas **Entrar** e **Criar conta**.
- Entrar: e-mail, senha (com mostrar/ocultar), botão “Entrar”. A autenticação é **simulada**: confere e-mail e senha com os usuários do store.
- Criar conta: nome, e-mail, senha (mínimo 6 caracteres) e dois cartões de perfil: **“Sou jogador”** e **“Sou gestor de arena”**. Cria o usuário no store e já abre a sessão.
- Texto de ajuda discreto abaixo do formulário: “Versão de demonstração. Para testar, use jogador@agendaarena.demo ou gestor@agendaarena.demo, com a senha 123456. Os dados ficam salvos apenas neste navegador.”
- Mensagens de erro ao lado do campo: credenciais inválidas = “E-mail ou senha incorretos”; e-mail repetido = “Este e-mail já está cadastrado”; senha curta = “A senha deve ter pelo menos 6 caracteres”.
- Após entrar: jogador vai para `/agenda`; gestor vai para `/gestor/solicitacoes`, ou para `/gestor/arena` se ainda não tiver arena cadastrada.

### T02 · Agenda de horários (jogador)
- Lista apenas arenas com `publicada == true`. Seletor de arena, depois seletor de quadra (abas) da arena escolhida.
- Faixa com os **próximos 7 dias**, começando em hoje (hoje selecionado).
- Grade de horários gerada conforme a seção 11, com os estados:
  **Livre** (selecionável), **Ocupado**, **Bloqueado**, **Encerrado** (horário que já passou) e **Selecionado**. Cada cartão mostra o horário (`18:00 - 19:00`) e o valor. O estado sempre aparece em texto, não só em cor.
- Legenda dos estados.
- Barra fixa no rodapé com o resumo do horário escolhido e o botão **“Solicitar reserva”** (desabilitado sem seleção). O botão leva a T03 com os parâmetros na URL.
- Estado vazio quando não houver arena publicada: “Nenhuma arena com agenda publicada ainda”.

### T03 · Solicitar reserva (jogador)
- Resumo: arena, quadra, data (por extenso, ex.: “Sábado, 14/11”), horário e valor. Texto: “Pagamento feito diretamente na arena”.
- Campo opcional “Nome do time ou observação”.
- Aviso âmbar: “Sua solicitação ficará Pendente até a aprovação do gestor da arena.”
- Botões **“Enviar solicitação”** e **“Voltar”**.
- Ao enviar, chama `criarReserva`. Em caso de conflito (RN01) ou horário que já passou, mostra o toast “Este horário acabou de ser ocupado” e volta para a agenda. Em caso de sucesso, vai para T03b.

### T03b · Solicitação enviada
- Ícone de sucesso, título “Solicitação enviada!”, chip **Pendente**.
- Resumo da reserva e **protocolo** (os 8 primeiros caracteres do id da reserva, em maiúsculas).
- Bloco “O que acontece agora?” com 3 passos: 1) o gestor analisa a solicitação; 2) você vê o resultado em “Minhas reservas”; 3) o pagamento é feito na arena.
- Botões **“Ver minhas reservas”** e **“Voltar para o início”**.

### T04 · Minhas reservas (jogador)
- Abas **Próximas** (status Pendente ou Confirmada com início no futuro) e **Histórico** (Recusada, Cancelada ou já passadas), com contador em cada aba. Lista filtrada por `jogadorId` da sessão.
- Cartão: arena, quadra, data, horário, valor e **chip de status** (Pendente = âmbar, Confirmada = verde, Recusada = vermelho, Cancelada = cinza).
- Botão **“Cancelar”** nas reservas Pendente ou Confirmada que ainda não começaram. Abre o modal T05.
- Faixa de aviso no topo quando houver reserva Confirmada ou Recusada com `avisoVisto == false`: “Sua reserva de [dia] foi confirmada!” ou “Sua solicitação de [dia] foi recusada”. Ao dispensar a faixa (botão fechar), chama `marcarAvisoVisto`.
- Estado vazio: “Você ainda não tem reservas” e botão “Ver horários”.

### T05 · Cancelar reserva (modal)
- Resumo (quadra, data, horário) e a regra: “Cancelamento permitido até **N horas** antes do horário”, com `N` vindo de `prazoCancelamentoHoras` da arena.
- Se faltarem **N horas ou mais**: botões **“Confirmar cancelamento”** (vermelho) e **“Manter reserva”**. Confirmar executa `cancelarReserva` e mostra o toast “Reserva cancelada”.
- Se faltar menos: estado **“Prazo de cancelamento expirado”**, com o texto “Esta reserva começa em menos de N horas e não pode mais ser cancelada pelo app. Entre em contato com a arena.” e um único botão **“Entendi”**.

### T06 · Solicitações pendentes (gestor)
- Cabeçalho com o nome da arena e o contador de pendentes.
- Lista das reservas `Pendente` da arena, da mais antiga para a mais nova.
- Cartão: nome do jogador, observação (se houver), quadra, data, horário, valor e tempo do pedido (“há 10 min”).
- Botões **“Aprovar”** (verde) e **“Recusar”** (contorno vermelho).
  - Aprovar: `aprovarReserva` define `status = 'Confirmada'` e `avisoVisto = false`. Toast “Reserva confirmada”.
  - Recusar: `recusarReserva` define `status = 'Recusada'` e `avisoVisto = false` (RN06). Toast “Solicitação recusada”.
- Estado vazio: “Nenhuma solicitação pendente”.

### T07 · Reservas do dia (gestor)
- Seletor de data (padrão: hoje) com setas anterior e próximo.
- Abas por quadra da arena.
- Resumo: “N reservas confirmadas · M horários livres”.
- Lista de horários da quadra naquele dia, na ordem, usando a geração da seção 11:
  - **Confirmada:** nome do jogador e observação, mais a caixa **“Compareceu”** (chama `marcarComparecimento`).
  - **Pendente:** exibida como “Pendente de aprovação”, sem ações.
  - **Livre:** botão **“Bloquear”**. **Bloqueado:** motivo e botão **“Liberar”**.
- Estado vazio: “Nenhuma reserva para este dia”.

### T08 · Arena e quadras (gestor)
- Formulário da arena: nome, bairro ou endereço, telefone e **prazo mínimo de cancelamento (horas)**, com padrão 24. Botão **“Salvar arena”** (cria ou atualiza a arena do gestor).
- Lista de quadras com nome, tipo e ações de **editar** e **excluir**.
- Botão **“Adicionar quadra”**: formulário com nome e tipo (Society, Futsal ou Areia), usando os padrões da seção 6.1. Botão **“Salvar quadra”**.
- Excluir só é permitido se a quadra não tiver reserva ativa futura. Caso contrário, mostre o toast “A quadra tem reservas ativas e não pode ser excluída”. Confirme a exclusão antes de executar. Ao excluir, remova também os bloqueios da quadra.
- Sem arena salva, as quadras ficam desabilitadas, com a mensagem “Salve os dados da arena primeiro”.

### T09 · Horários e bloqueios (gestor)
- Abas por quadra.
- Cartão **Funcionamento**: chips dos dias da semana (ligar e desligar), abertura, fechamento, duração do horário (60, 90 ou 120 min) e valor por horário. Botão **“Salvar configuração”**. Validação: abertura anterior ao fechamento, valor maior que zero.
- Cartão **Bloqueio rápido**: faixa com os próximos 14 dias e a grade de horários do dia escolhido (seção 11). Toque em horário Livre bloqueia (usando o texto do campo **“Motivo”**, padrão “Indisponível”). Toque em horário Bloqueado libera. Horário com reserva ativa não pode ser bloqueado: toast “Este horário tem uma reserva ativa”.
- Botão fixo **“Publicar agenda”**: define `publicada = true` na arena e mostra o toast “Agenda publicada! Os jogadores já podem ver os horários.” Se a arena não tiver quadras, mostre “Cadastre ao menos uma quadra antes de publicar”.

## 10. Visual

Use as telas do Stitch como **referência visual** (cores, espaçamento, tipo de cartões e botões). Elas estão em `referencias/stitch/`; cada pasta tem `screen.png` e `code.html`.

| Pasta | Tela |
|---|---|
| `login_e_cadastro_agendaarena` | T01 |
| `agenda_de_hor_rios_arena_boa_bola` | T02 |
| `solicitar_reserva_agendaarena` | T03 |
| `solicita_o_enviada_agendaarena` | T03b |
| `minhas_reservas_agendaarena` | T04 |
| `modal_cancelar_reserva_agendaarena` | T05 |
| `solicita_es_pendentes_gestor_arena` | T06 |
| `reservas_do_dia_gestor_arena` | T07 |
| `minha_arena_e_quadras_gestor_arena` | T08 |
| `hor_rios_e_bloqueios_gestor_arena` | T09 |
| `bahia_pitch_play/DESIGN.md` | design system |

**Siga o texto desta especificação, não o protótipo, quando houver diferença.** O protótipo tem erros que **não** devem ser copiados: logotipo com imagem quebrada, datas de 2023 e 2024, menu do jogador nas telas do gestor, e extras fora do escopo (seção 2).

Tokens principais (do `DESIGN.md`): primária `#006438`, container primário `#1B7F4C`, fundo `#F8F9FF`, texto `#121C2A`, erro `#BA1A1A`, âmbar para Pendente (`#996400` em texto e um fundo claro). Fonte Inter. Cantos arredondados de 8 a 12 px.

- Logotipo: ícone de bola (Material Symbol `sports_soccer`) + texto “AgendaArena”.
- Botões de largura total, com no mínimo 48 px de altura. Alvos de toque de pelo menos 44 px.
- Chips de status sempre com texto.
- Layout mobile-first (base 390 px). Em telas largas, centralize o conteúdo com largura máxima de cerca de 640 px.
- Toast no topo ou no rodapé, com `aria-live="polite"`, que some sozinho em poucos segundos.
- Todo botão tem `type` correto e os campos têm `label`.

## 11. Lógica de domínio

### 11.1 Geração dos horários (`agenda.util.ts`, funções puras e testadas)
`gerarHorarios(quadra, data)`:
1. Se o dia da semana de `data` não estiver em `diasSemana`, retorna lista vazia.
2. Partindo de `abertura`, cria horários de `duracaoMin` minutos enquanto `fim <= fechamento`. Cada item tem `hora` (início, `HH:mm`) e `horaFim`.

`estadoDoHorario(horario, data, bloqueios, reservasAtivas, agora)`, nesta ordem de prioridade:
1. início no passado (`início <= agora`) → **Encerrado**;
2. existe bloqueio com a mesma chave → **Bloqueado**;
3. existe reserva ativa com a mesma chave → **Ocupado**;
4. caso contrário → **Livre**.

### 11.2 Operações do store
- **`criarReserva`:** aborta se o horário já passou, se houver bloqueio ou se já houver reserva ativa na mesma chave. Senão, cria a reserva (`Pendente`, `avisoVisto = false`, `comparecimento = null`, `valor` copiado da quadra, nomes copiados de arena, quadra e jogador, `criadaEm = agora`) e devolve o id.
- **`aprovarReserva`:** `status = 'Confirmada'`, `avisoVisto = false`, `atualizadaEm = agora`.
- **`recusarReserva`:** `status = 'Recusada'`, `avisoVisto = false`, `atualizadaEm = agora`.
- **`cancelarReserva`:** `status = 'Cancelada'`, `atualizadaEm = agora`.
- Operações que podem falhar devolvem um resultado com mensagem de erro (por exemplo `{ ok: false, erro: '...' }`), que a tela exibe como toast. Não lance exceções para fluxos normais.

### 11.3 Cancelamento
`podeCancelar(inicio, agora, prazoHoras)` retorna verdadeiro quando `(inicio - agora) >= prazoHoras * 3600000` (função pura e testada).

### 11.4 Rótulos
Helpers em `datas.util.ts` para “Sábado, 14/11”, “14 de novembro”, “há 10 min” e para montar a lista dos próximos N dias a partir de hoje.

## 12. Testes e critérios de aceite

### Testes unitários
- `gerarHorarios`: das 17:00 às 23:00 com 60 min gera 6 horários; com 90 min gera 4 (o último termina às 23:00); dia fora de `diasSemana` gera lista vazia.
- `estadoDoHorario`: respeita a ordem Encerrado, Bloqueado, Ocupado e Livre.
- `podeCancelar`: verdadeiro com 24 h exatas e falso com 23 h 59 min, para prazo de 24 h.
- Store: `criarReserva` no mesmo horário duas vezes falha na segunda (RN01); `recusarReserva` e `cancelarReserva` liberam o horário (RN06); `criarDadosDemo` não produz duas reservas ativas na mesma chave.

### Checklist manual (rode antes de entregar)
1. Abrir o app limpo. Entrar como **gestor** (`gestor@agendaarena.demo`): ver as solicitações pendentes (T06), as reservas do dia (T07), a arena e as quadras (T08) e os horários (T09).
2. Em T08, editar a arena e adicionar uma quadra. Em T09, ajustar o funcionamento, bloquear um horário e **publicar a agenda**.
3. Sair e entrar como **jogador** (`jogador@agendaarena.demo`). Em T02, ver o horário bloqueado como “Bloqueado” e os horários ocupados como “Ocupado”.
4. Solicitar uma reserva (T02, T03, T03b). Em T04 ela aparece como **Pendente**.
5. Sair e entrar como gestor. Ver a nova solicitação em T06 e **aprovar**. Voltar como jogador e ver o status **Confirmada** e a faixa de aviso em T04.
6. Solicitar outro horário, entrar como gestor e **recusar**. Conferir que o horário volta a ficar **Livre** na agenda (RN06).
7. Tentar solicitar um horário já ocupado (por exemplo, o de uma reserva pendente de exemplo): o app deve impedir (RN01).
8. Cancelar uma reserva com prazo suficiente (T05) e conferir que o horário foi liberado. Conferir também a mensagem de **prazo expirado** com uma reserva que comece em menos de N horas (ajuste o prazo da arena em T08 para testar).
9. Em T07, marcar **Compareceu**, bloquear e liberar horários.
10. Criar uma conta nova (jogador e gestor) em T01.
11. Conferir que o jogador não acessa rotas do gestor, e vice-versa (RNF03).
12. Recarregar a página em uma rota interna: o estado e a sessão se mantêm. Usar **“Restaurar dados de demonstração”**: os dados voltam ao início.
13. Abrir no celular (ou no modo responsivo do navegador) e conferir RNF01.
14. Rodar `ng build --configuration production` sem erros e recarregar uma rota interna no site publicado (deve funcionar, por causa da hash).

## 13. Publicação no GitHub Pages

1. Crie o projeto com o nome `agendaarena`, de modo que o build saia em `dist/agendaarena/browser`.
2. Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy no GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx ng build --configuration production --base-href "/${{ github.event.repository.name }}/"
      - run: cp dist/agendaarena/browser/index.html dist/agendaarena/browser/404.html
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/agendaarena/browser
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Confirme as versões atuais das actions e do Node, e ajuste se necessário.

3. O app fica em `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`.
4. Garanta que `referencias/` não entre no build (ela fica fora de `src`).

## 14. Entregáveis finais

- Repositório com todo o código, o workflow de deploy e a pasta `referencias/stitch/`.
- `README.md` em português com: o que é o projeto; **aviso de que é uma demonstração sem backend, com dados salvos só no navegador**; contas de teste; como rodar localmente (`npm install`, `ng serve`); como o deploy funciona; e a lista das decisões tomadas onde esta especificação era ambígua.
- Site publicado e funcionando no GitHub Pages.