# AgendaArena

Aplicação web de reserva de quadras para pequenas arenas de society em Salvador (BA). O projeto é a demonstração navegável da atividade semestral de Processos de Negócios (UCSAL): reúne a agenda do jogador e o painel do gestor da arena em um único fluxo, do pedido de reserva até a aprovação, o cancelamento e o comparecimento.

> **Aviso:** esta é uma demonstração **sem backend, sem banco de dados e sem autenticação real**. Todos os dados ficam salvos apenas no `localStorage` do navegador em que o app foi aberto, na chave `agendaarena.demo.v1`. Nada é sincronizado entre aparelhos. Ao usar **Restaurar dados de demonstração** no menu do usuário, os dados de exemplo são recarregados a partir da data de hoje.

## Contas de teste

| Perfil          | E-mail                     | Senha    |
| --------------- | -------------------------- | -------- |
| Gestor da arena | `gestor@agendaarena.demo`  | `123456` |
| Jogador         | `jogador@agendaarena.demo` | `123456` |

A tela de login também permite criar contas novas de jogador ou de gestor. Os jogadores de exemplo Rafael Menezes, Marcos Lima e Ana Souza existem apenas como autores das reservas de demonstração e não têm login.

## O que funciona

- **Jogador:** consulta de arenas publicadas, quadras e horários dos próximos 7 dias; solicitação de reserva; acompanhamento em “Minhas reservas”; avisos de confirmação e recusa; cancelamento com prazo mínimo definido pela arena.
- **Gestor:** aprovação ou recusa de solicitações; reservas do dia com marcação de comparecimento; bloqueio e liberação de horários; cadastro de arena e quadras; configuração de dias, horários, duração e valor; publicação da agenda.
- **Sessão:** login, cadastro e logout simulados, com sessão e dados persistidos no navegador.
- **Demonstração:** dados de exemplo relativos a hoje; restauração pelo menu do usuário.

## Como rodar localmente

Pré-requisito: Node.js 22 ou superior e npm.

```bash
npm install
npm start
```

Abra `http://localhost:4200`. Para gerar o build de produção:

```bash
npm run build
```

O resultado fica em `dist/agendaarena/browser`.

## Testes

```bash
npm test -- --watch=false
```

Os testes unitários cobrem a geração de horários, a prioridade dos estados dos horários, a regra de cancelamento e as regras principais do store (conflito de horário, recusa, cancelamento e consistência dos dados de exemplo).

## Publicação no GitHub Pages

1. Crie um repositório no GitHub e envie o projeto para a branch `main`.
2. Em **Settings > Pages > Source**, selecione **GitHub Actions**.
3. O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) roda a cada push na `main`: instala as dependências, faz o build de produção com `base-href` igual ao nome do repositório, copia o `index.html` para `404.html` e publica em Pages.
4. O app fica em `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`.

O roteamento usa `withHashLocation()`, então recarregar uma rota interna funciona mesmo no GitHub Pages.

## Estrutura

```text
src/app/
  core/       modelos, dados de exemplo, store, sessão, guards e utilitários de agenda/data
  shared/     cabeçalho, navegação inferior, toast, modal, chip de status, estado vazio e seletor de data
  features/   login; telas do jogador (agenda, reserva, minhas reservas) e do gestor
referencias/stitch/   protótipo visual do Stitch, fora do build
.github/workflows/    deploy no GitHub Pages
```

## Decisões tomadas

Onde a especificação deixou margem de escolha, foram adotadas as decisões abaixo.

- **Protótipo do Stitch:** os arquivos foram copiados para `referencias/stitch/` e usados apenas como referência visual. A implementação segue o texto da especificação quando há diferença.
- **Restauração dos dados:** a sessão é mantida quando o usuário logado também existe nos dados de exemplo (as contas de demonstração). Se for uma conta criada pelo usuário, a sessão é encerrada e o app volta ao login, pois essa conta deixa de existir após a restauração.
- **Cancelamento:** a regra de prazo é validada na tela T05 **e** no store. Assim, nenhuma chamada direta ao store consegue cancelar fora do prazo.
- **Mensagens de horário indisponível:** conflito de reserva e horário já passado mostram “Este horário acabou de ser ocupado”, como pede a especificação. Um horário bloqueado acessado por URL direta mostra “Este horário está bloqueado”.
- **T07 sem reservas:** os horários livres continuam visíveis para que o gestor possa bloqueá-los. O estado vazio “Nenhuma reserva para este dia” aparece quando não há horários gerados (quadra fechada) ou quando não há quadras cadastradas.
- **Avisos de resultado:** a faixa de aviso é exibida por reserva com `avisoVisto = false`. Se houver mais de uma, cada uma pode ser dispensada individualmente.
- **Arena nova:** começa com `publicada = false`. Após o cadastro, o gestor é levado para `/gestor/arena` para completar quadras e configuração antes de publicar.
- **Quadras novas:** usam os padrões da especificação (todos os dias, 17:00 às 23:00, 60 min, R$ 120). A tela T08 edita apenas nome e tipo; os demais campos ficam em T09.
- **Exclusão de quadra:** exige confirmação, remove os bloqueios da quadra e é recusada quando existe reserva Pendente ou Confirmada futura na quadra.
- **Horas:** os valores são armazenados e comparados como `HH:mm` no horário local, nunca em UTC. Os campos de abertura e fechamento usam o input nativo de horário do navegador para melhor usabilidade no celular.
- **Sessão:** também é persistida no `localStorage`, junto com o restante do estado, para sobreviver a recarregamentos.
- **Contas sem login:** usuários de exemplo sem e-mail/senha não conseguem autenticar, mesmo que alguém tente enviar credenciais vazias diretamente.
- **Protocolo:** é formado pelos 8 primeiros caracteres do `id` da reserva, em maiúsculas, tanto para as reservas de exemplo quanto para as novas.
- **Acessibilidade:** ícones decorativos são ocultados de leitores de tela, os campos têm `label`, os botões têm `type` explícito e o toast usa uma região persistente com `aria-live="polite"`.
