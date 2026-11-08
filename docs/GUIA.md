# Meu portfolio: o plano

## Por que estou fazendo isso

Quero um portfolio que fique comigo por anos, não um site feito às pressas para uma vaga. A ideia é que ele cresça junto com os meus projetos, inclusive os que eu conseguir vender.

Vou mirar vagas de **front-end, backend e fullstack**. A meta é começar a aplicar em **fev/mar de 2027**. Até lá quero ter mais projetos, mais experiência com problema real e estar mais ativo na comunidade dev.

O visual é de editor Neovim com terminal, a mesma identidade do meu README do GitHub (paleta verde, `perfil.md`, barra NORMAL), só que interativo.

Penso em duas pessoas abrindo o site:

- **O recrutador:** precisa entender em menos de um minuto quem eu sou e o que eu construo, sem saber nenhum comando.
- **O dev ou tech lead:** precisa achar profundidade de verdade, ou seja, arquitetura, testes e um backend feito por mim, com Java rodando de verdade.

Dá para navegar de dois jeitos, e qualquer um basta:

- **Clicando:** árvore de arquivos, abas, quatro atalhos grandes na página inicial (teclas 1 a 4) e comandos clicáveis.
- **Digitando:** um shell com sistema de arquivos virtual (`cd`, `ls -la`, `cat`, `grep`, pipes), para quem curte terminal.

A primeira versão pública vai ser a **v0.0.1**, e ela só sai quando estiver completa (seção "O que conta como v0.0.1"). Até lá eu vou publicando o que tiver pronto, só para garantir que o deploy funciona.

## Minhas regras

Quando eu ficar em dúvida sobre alguma decisão, volto aqui.

1. **Ninguém precisa digitar comando.** Tudo que o terminal faz também tem que ter botão ou link.
2. **O site não pode quebrar sem a API.** Se o backend cair, o recurso que depende dele mostra um aviso honesto e aponta para o código; o resto do site segue igual.
3. **Texto só em `src/data`.** Nunca escrever conteúdo direto num componente.
4. **Todo texto já nasce em `{ pt, en }`.** O inglês pode ficar provisório, mas a estrutura vem desde o começo, para eu não ter que caçar texto depois.
5. **Cor só por variável CSS.** Nenhuma cor fixa fora do `@theme` e dos temas. Nada de `bg-[#101610]` ou `text-green-400` num componente: só as cores do tema (`bg-bg`, `text-accent`…).
6. **O essencial fica no HTML.** Nome, cargo, resumo e tags `og:` no `index.html`, para o LinkedIn, o WhatsApp e o Google lerem sem rodar JS.
7. **Mostrar o que eu sei, não o que falta.** Nada no site lista o que eu ainda não domino.
8. **Demos de verdade.** As demos rodam no meu backend, não numa simulação no navegador. Se ele não responder, a página diz isso e aponta para o código.
9. **Funcionar no celular e no teclado.** 375 px sem rolagem lateral, e dá para navegar tudo sem mouse.

## Como vai funcionar

```
┌──────────────────────────────┐        ┌──────────────────────────────────────┐
│ lordcarvel.github.io         │ fetch  │ Cloudflare                           │
│ Vite + React + TS, estático  │ ─────► │                                      │
│                              │        │ Worker (TypeScript)  ← porta de      │
│ registro de buffers          │        │ ├─ rotas, CORS, limite, validação    │
│ ├─ árvore, abas, rotas       │        │ ├─ D1 (SQLite): contato, produtos    │
│ ├─ busca Ctrl+K              │        │ ├─ demos em TS: vaga e comanda       │
│ └─ shell + FS virtual        │        │ └─ Container (Java)                  │
│                              │        │     carvel-http + Cdatra: ORM real   │
│ sem API: aviso + link do     │ ◄───── │                                      │
│ código, o resto segue igual  │        │ HTTPS e certificado: a Cloudflare    │
└──────────────────────────────┘        └──────────────────────────────────────┘
```

### O front

**Stack:** Vite + React + TypeScript, Tailwind CSS v4, ESLint e Vitest. O deploy é pelo GitHub Actions no GitHub Pages.

**Estilo com Tailwind:** uso o plugin `@tailwindcss/vite`, sem `tailwind.config.js`; a configuração fica no CSS. As cores do tema padrão moram no `@theme` do `src/index.css`, e cada cor de lá vira uma variável CSS (`--color-accent`) e uma classe (`bg-accent`, `text-accent`, `border-accent`). Um tema novo só sobrescreve essas variáveis num seletor `[data-theme="…"]`, então nenhum componente muda. O que o Tailwind não resolve bem fica em CSS puro, em `src/styles/`: o contador de linhas do `<Doc>` (`counter()`), a impressão do currículo e o `prefers-reduced-motion`.

Escolhi React porque é o que mais aparece nas vagas de front e fullstack. Mas não quero que vire um app de tutorial cheio de biblioteca. O roteador por hash, o i18n, o shell e a busca eu escrevo na mão. Só coloco uma lib nova quando ela resolver algo que não vale a pena eu reimplementar.

O TypeScript está fixado em `~6.0.x` porque o `typescript-eslint` 8 ainda não aceita o 7. Quando ele passar a aceitar, eu volto para o 7.

**O coração é o registro de buffers.** Cada página é um objeto que entra no registro uma vez. A árvore, as abas, as rotas, a busca e o shell leem desse registro, então uma página nova aparece em todos eles sem eu mexer em mais nada. O registro é TS puro: não depende de React e eu consigo testar sem DOM.

```ts
type Localized<T = string> = { pt: T; en: T };

// EditorBuffer, não Buffer: `Buffer` é uma global do Node.
interface EditorBuffer {
  id: string;                         // rota: #/sobre
  name: Localized;                    // nome do arquivo: sobre.md / about.md
  title: Localized;                   // título nas duas línguas
  dir?: string;                       // pasta virtual: 'projetos'
  isDir?: boolean;                    // pastas também são buffers (a página de índice)
  keywords?: string;                  // para a busca
  lines: (lang: Lang) => Line[];      // fonte única: <Doc>, cat e grep usam isto
  Component?: React.ComponentType;    // páginas com algo ao vivo (perfil, atividade, demos)
}
```

No protótipo, o `cat` e o `grep` renderizavam a página escondida e liam o `innerText`. Era gambiarra. Aqui o `lines()` é uma função pura que sai dos dados: o `<Doc lines={…} />` desenha e o terminal lê as mesmas linhas.

**Estado global sem biblioteca:** idioma, tema, buffer aberto, abas e terminal ficam em Contexts (`LangProvider`, `ThemeProvider`, `EditorProvider`, `TerminalProvider`). Se crescer demais, `useReducer` resolve antes de eu precisar de Redux ou Zustand.

**A regra que eu não posso esquecer:** lógica em `.ts` puro (registro, router, `resolvePath`, parser do shell, busca, cliente da API), com teste de unidade. Os `.tsx` só montam a tela e chamam essa lógica.

| Onde | O que faz |
|---|---|
| `core/registry.ts` | `createRegistry(lista)` com `get()`, `has()` e `all()` sobre um `Map` (TS puro) |
| `core/router.ts` + `hooks/useHashRoute.ts` | hash → buffer, `hashchange`, voltar e avançar do navegador |
| `components/Doc.tsx` | linhas numeradas com `counter()` no CSS |
| `components/` | a moldura: `Tabs`, `FileTree`, `Editor`, `Terminal`, `StatusBar`, `Palette` |
| `context/` | `LangProvider`, `ThemeProvider`, `EditorProvider` (buffer aberto e abas), `TerminalProvider` (sessão, pasta atual e `runCommand`) |
| `i18n/` | idioma atual (`?lang=`, depois `localStorage`, depois o navegador), `tr()`, `loc()`, `useLang()` |
| `data/` | perfil, stack, projetos, contatos e textos da interface, tudo tipado |
| `themes/` | lista dos temas (id e nome em `{ pt, en }`) para o seletor; as variáveis de cada um ficam no CSS, em `[data-theme="…"]` |
| `services/github.ts` | API pública do GitHub com cache de 15 min no `sessionStorage` |
| `services/api.ts` | cliente da minha API: timeout, health check e o aviso quando ela não responde |
| `terminal/` | parser, FS virtual, `resolvePath()`, comandos, pipes, Tab (TS puro) |
| `palette/` | pontuação da busca por subsequência (TS puro); a caixa é um componente |
| `demos/` | as telas das demos (ORM, vaga, comanda): mandam os dados para a API e mostram a resposta |
| `pages/` | uma página por arquivo; `pages/index.ts` monta o registro na ordem da árvore |

### O back

O backend roda na **Cloudflare**: um **Worker** em TypeScript na frente, o **D1** (SQLite) como banco e um **Container** com Java para o que precisa do Cdatra de verdade. HTTPS, certificado e escala ficam com a Cloudflare.

Por que assim: o Worker não roda Java, só JS/TS (e WASM). Então o Worker cuida das rotas, do banco e das demos que fazem sentido em TS, e chama o Container quando a resposta precisa sair do Cdatra. Quem abre o código vê as duas coisas: um backend serverless em TS e um serviço Java meu, com o meu servidor HTTP.

| Repositório (nome provisório) | O que é |
|---|---|
| `carvel-http` | meu servidor HTTP/1.1 em Java puro, como biblioteca que eu possa reaproveitar |
| `portfolio-api` | o Worker (TS) com o D1 e, numa pasta `container/`, o serviço Java (`carvel-http` + Cdatra) que o Worker chama |

O contrato continua sendo a fonte da verdade: um `openapi.yaml` com as rotas e um formato único de erro. Os testes de contrato rodam contra o Worker de verdade (`wrangler dev`), e o front usa um mock gerado do contrato enquanto o back não existe.

**Endpoints da primeira versão:**

| Rota | Quem responde | Para quê | Sem API, o site mostra |
|---|---|---|---|
| `GET /health` | Worker | status, versão e se o Container está de pé | esconde o indicador da API |
| `POST /orm/generate` | Worker → Container | entidade Java → SQL gerado pelo Cdatra de verdade, com diagnósticos | aviso + link do Cdatra |
| `POST /match` | Worker | descrição de vaga → encaixe e a prova em cada projeto, **sem lista do que falta** | aviso + link do código |
| `POST /orders/ticket` | Worker | pedido → comanda formatada em 58 ou 80 mm | aviso + link do Easy Hub |
| `POST /contact` | Worker + D1 | mensagem com validação e limite de envios | o e-mail e o botão de copiar |
| `GET /products` | Worker + D1 | catálogo dos projetos que eu estiver vendendo | lista fixa em `src/data` |

Depois, se fizer sentido: visitas, livro de visitas, status dos projetos.

**O que o backend precisa ter:** CORS só para `lordcarvel.github.io` e `localhost`, limite de requisições por IP, tamanho máximo de corpo, validação de entrada, logs estruturados e erros em JSON sempre no mesmo formato.

## Onde fica cada coisa

```
LordCarvel.github.io/
├── docs/GUIA.md
├── index.html                 moldura + conteúdo essencial estático + og:tags
├── public/                    curriculo.pdf, og-image.png, favicon
├── src/
│   ├── App.tsx / Main.tsx     entrada (createRoot) e componente raiz
│   ├── components/  context/  hooks/
│   ├── core/  i18n/  data/  themes/  services/
│   ├── terminal/  palette/  demos/  pages/
│   ├── index.css              @import "tailwindcss", @theme (cores) e temas
│   └── styles/                CSS puro: contador do <Doc>, impressão, movimento reduzido
├── *.test.ts ao lado do código testado
├── eslint.config.js
├── vite.config.ts             base: '/' (padrão)
└── .github/workflows/deploy.yml   lint → test → build → Pages
```

## Passo a passo

Cada etapa termina com algo funcionando, e eu faço um commit no fim de cada uma. Se algo quebrar, volto para a última versão boa. No front a ordem importa, porque cada etapa usa a anterior. O back eu vou tocando em paralelo, e as duas trilhas se encontram no F11.

### Front

**F1. Projeto e deploy.** ✅ Vite com o template `react-ts` e ESLint, `.gitattributes` com `eol=lf`, Vitest com um teste bobo e o workflow do Pages publicando um "olá".
- Conferir: o push na `main` passa por lint, teste e build, e publica sozinho.

**F2. Moldura e cores.** ✅ Os componentes `Tabs`, `FileTree`, `Editor`, `Terminal` e `StatusBar`. Tailwind instalado (`tailwindcss` + `@tailwindcss/vite`). CSS Grid com `grid-template-areas` e `height: 100dvh`. Todas as cores no `@theme`, com a paleta do README do GitHub.
- Conferir: só o editor rola, a página não. Trocar `--color-accent` no DevTools muda tudo que é verde.

**F3. Dados tipados e i18n básico.** ✅ `Localized<T>`, a pasta `data/` com perfil, stack e projetos, mais `tr()` e `loc()`. Os textos já nascem nas duas línguas.
- Conferir: o TypeScript reclama se faltar o `en` em algum campo.

**F4. Buffers e rotas.** ✅ Registro, router com `useHashRoute`, `<Doc>` com linhas numeradas e `lines()` como fonte única.
- Conferir: `#/sobre` abre a página certa e o voltar do navegador funciona. O router tem testes.

**F5. Páginas e HTML estático.** ✅ Perfil (com os 4 atalhos), sobre, stack, projetos, uma página por projeto, contato e currículo. Árvore e abas geradas pelo registro. O essencial e as tags `og:` no `index.html`.
- Conferir: adicionar um projeto em `data/` faz ele aparecer na árvore, na lista e na busca. O link no LinkedIn mostra título e imagem (depois do deploy, com a `og:image`).

**F6. GitHub ao vivo.** ✅ Repositórios, último push e gráfico de 30 dias, com cache e plano B.
- Conferir: sem internet, o site continua inteiro.

**F7. Terminal básico.** ✅ Entrada, histórico com as setas, `help` e `clear`. O `<Cmd run="…" />` gera os comandos clicáveis e chama o `runCommand` do contexto.

**F8. FS virtual e comandos.** ✅ `resolvePath()`, `ls`, `cd`, `pwd`, `cat`, `tree`, `grep`, `find`, `head`, `wc` e `man`. Depois Tab, pipes, `sort` e `tail`.
- Conferir: `cd projetos`, `ls`, `cd ..`, `grep java | head -3`. O `resolvePath` e o parser de pipes têm testes.

**F9. Busca Ctrl+K.** ✅ Pontuação por subsequência, com setas e Enter.
- Conferir num navegador comum, porque no protótipo o atalho não respondia dentro do painel de um app.

**F10. Temas e idioma completo.** 3 ou 4 temas (um escuro, um claro e um ou dois favoritos), com prévia ao vivo na tecla T. Inglês revisado.
- Conferir: contraste AA em todos os temas.

**F11. Ligar na API.** `services/api.ts` com timeout, health check e o aviso quando a API não responde. Enquanto o back não existir, uso um mock gerado a partir do contrato. O comando `api` e a barra de status mostram se ela está de pé.
- Conferir: com a API desligada, o site inteiro funciona e cada recurso dela mostra o aviso. Com ela ligada, o indicador fica verde.

**F12. Demos reais.** As telas em `demos/`, cada uma chamando a API:
1. ORM: entidade Java → SQL gerado pelo Cdatra no Container.
2. Comparador de vaga: mostra o encaixe e a prova em cada projeto, **sem lista do que falta**.
3. Comanda: 58 e 80 mm, com a animação de impressão.
- Conferir no ORM: apagar o `@Id` mostra o erro e escrever `columnName` mostra o aviso, vindos do Cdatra. Sem API, cada demo mostra o aviso e o link do código.

**F13. Acabamento.** Gaveta no celular, CSS de impressão do currículo, `prefers-reduced-motion`, foco visível, `aria-label` e Lighthouse.
- Conferir: 375 px sem rolagem lateral, navegação inteira só com teclado e Lighthouse ≥ 90 em tudo.

**F14. Lançar a v0.0.1.** Dados reais conferidos (seção "Antes de lançar"), tag `v0.0.1`, link na bio e no README do GitHub, GIF no README.

### Back (repositórios separados)

**B1. Contrato.** `openapi.yaml` com os endpoints de cima e um formato único de erro. Com isso o front já consegue usar o mock.

**B2. `carvel-http`.** Sockets, parser de HTTP/1.1 (linha de requisição, headers, corpo com `Content-Length` e chunked), roteador, keep-alive, timeouts e pool de threads (ou virtual threads). Tudo com teste.

**B3. Worker e D1.** `wrangler` com o Worker em TS, `GET /health`, CORS, erro JSON padrão, o schema do D1 com migrations, `POST /contact` e `GET /products`. Rodando local com `wrangler dev`.

**B4. Container Java.** O serviço `carvel-http` + Cdatra respondendo `POST /orm/generate`, empacotado num Dockerfile. O Worker encaminha a rota para o Container e devolve a resposta.

**B5. Demos em TS no Worker.** `POST /match` e `POST /orders/ticket`, com a lógica em funções puras e testes.

**B6. Robustez.** Limite de requisições, limite de corpo, validação, logs e testes de contrato contra o `wrangler dev`.

**B7. Deploy.** `wrangler deploy` pelo CI do repositório, secrets configurados, domínio da API e o front apontando para ela.

**B8. (Depois) Spring Boot.** Se ainda quiser mostrar Spring, uma segunda implementação do serviço Java passando nos mesmos testes de contrato.

## O que conta como v0.0.1

Do front, F1 a F14. Do back, B1 a B7. O Spring (B8) pode vir numa v0.0.x seguinte.

## Antes de lançar

**Trocar o que é fantasia no protótipo**
- [ ] E-mail real
- [ ] LinkedIn real
- [ ] Currículo PDF real
- [ ] Revisar os textos em inglês

**Já decidido**
- [x] Banco da API: D1 (SQLite da Cloudflare), que o Cdatra já suporta
- [x] Onde hospedar a API: Cloudflare (Worker + D1 + Container)

**Ainda preciso decidir**
- [ ] Domínio da API: `*.workers.dev` ou próprio (tipo `api.<dominio>`)
- [ ] Plano da Cloudflare: conferir se o Container exige o plano pago do Workers e quanto custa, antes do B4
- [ ] JSON no `carvel-http`: escrever meu próprio parser ou usar uma lib pequena
- [ ] Telefone: a ideia é deixar só no currículo

**Melhorias**
- [ ] `og:image` e `og:title`
- [ ] GIF de 10 segundos no README
- [ ] Link na bio do GitHub e no README do perfil

## Rodar e publicar

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm test           # modo watch; no CI roda uma vez
npm run build
```

Para publicar, basta dar push na `main`. O workflow `.github/workflows/deploy.yml` roda `npm ci`, `lint`, `test` e `build`, e publica a pasta `dist/` no Pages (Settings → Pages → Source: GitHub Actions). Se qualquer passo falhar, o site anterior continua no ar. O `base` fica em `'/'` porque o site está na raiz.

Commits em inglês, no padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`).

Link em inglês para mandar para recrutador de fora: `https://lordcarvel.github.io/?lang=en`.

## Cola rápida

**Atalhos (fora de campo de texto)**

| Tecla | Ação |
|---|---|
| 1 a 4 | atalhos da página inicial |
| `:` ou `/` | foca o terminal |
| T | seletor de temas com prévia |
| ? | lista os comandos |
| Ctrl K | busca rápida |
| Tab, ↑ ↓, Ctrl L, Ctrl C | no terminal: completar, histórico, limpar, cancelar |

**Comandos do terminal**

| Grupo | Comandos |
|---|---|
| Arquivos | `ls [-la]`, `cd`, `pwd`, `cat`, `open` (`vim`, `code`), `tree`, `find` |
| Texto e pipes | `grep`, `head -n N`, `tail`, `wc`, `sort` (ex.: `grep java \| head -3`) |
| Portfolio | `about`/`sobre`, `projects`/`projetos`, `stack`, `activity`/`atividade`, `resume`/`curriculo`, `contact`/`contato`; depois `match`/`vaga`, `orm`, `order`/`comanda`, `shop`/`loja` |
| Sistema | `help`, `man`, `lang`, `history`, `clear`, `echo`, `whoami`; depois `theme`/`tema`, `api` (status), `fullscreen`, `neofetch`, `date`, `uname -a`, `git log`, `git status`, `exit` |
| Segredos | `cat .segredo`, `sudo contratar`, `rm`, `whatsapp`, `copy-phone` |

**Coisas que já me morderam (ou vão morder)**

- **Nomes que sombreiam APIs do navegador ou do Node:** evitar `print`, `history`, `open`, `close`, `name` e `Buffer`, mesmo dentro de módulo, porque um import esquecido faz o código usar a global sem avisar. No terminal, usar `termPrint` e `cmdHistory`.
- **Nomes de arquivo:** componente em PascalCase (`FileTree.tsx`), o resto em camelCase (`resolvePath.ts`). Nunca trocar só a caixa de um nome no Windows: renomear em dois passos ou usar `git mv`, porque o CI roda em Linux e lá `main` e `Main` são arquivos diferentes.
- **Fim de linha:** o `.gitattributes` com `eol=lf` já resolve. Não mexer.
- **Tailwind só gera classe que aparece inteira no código:** `` `text-${cor}` `` não funciona. Escrever as classes completas num mapa (como o `KIND_CLASS` do `LineView`).
