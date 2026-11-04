# Meu portfolio: o plano

## Por que estou fazendo isso

Quero um portfolio que fique comigo por anos, não um site feito às pressas para uma vaga. A ideia é que ele cresça junto com os meus projetos, inclusive os que eu conseguir vender.

Vou mirar vagas de **front-end, backend e fullstack**. A meta é começar a aplicar em **fev/mar de 2027**. Até lá quero ter mais projetos, mais experiência com problema real e estar mais ativo na comunidade dev.

O visual é de editor Neovim com terminal, a mesma identidade do meu README do GitHub (paleta verde, `perfil.md`, barra NORMAL), só que interativo.

Penso em duas pessoas abrindo o site:

- **O recrutador:** precisa entender em menos de um minuto quem eu sou e o que eu construo, sem saber nenhum comando.
- **O dev ou tech lead:** precisa achar profundidade de verdade, ou seja, arquitetura, testes e um backend Java feito por mim.

Dá para navegar de dois jeitos, e qualquer um basta:

- **Clicando:** árvore de arquivos, abas, quatro atalhos grandes na página inicial (teclas 1 a 4) e comandos clicáveis.
- **Digitando:** um shell com sistema de arquivos virtual (`cd`, `ls -la`, `cat`, `grep`, pipes), para quem curte terminal.

A primeira versão pública vai ser a **v0.0.1**, e ela só sai quando estiver completa (seção 6). Até lá eu vou publicando o que tiver pronto, só para garantir que o deploy funciona.

## Minhas regras

Quando eu ficar em dúvida sobre alguma decisão, volto aqui.

1. **Ninguém precisa digitar comando.** Tudo que o terminal faz também tem que ter botão ou link.
2. **O site não pode depender da API.** Se o backend cair, cada recurso tem um plano B local.
3. **Texto só em `src/data`.** Nunca escrever conteúdo direto num componente.
4. **Todo texto já nasce em `{ pt, en }`.** O inglês pode ficar provisório, mas a estrutura vem desde o começo, para eu não ter que caçar texto depois.
5. **Cor só por variável CSS.** Nenhuma cor fixa fora de `:root` e dos temas.
6. **O essencial fica no HTML.** Nome, cargo, resumo e tags `og:` no `index.html`, para o LinkedIn, o WhatsApp e o Google lerem sem rodar JS.
7. **Mostrar o que eu sei, não o que falta.** Nada no site lista o que eu ainda não domino.
8. **Ser honesto nas demos.** Se algo for simulação, a página diz que é e aponta para o código real.
9. **Funcionar no celular e no teclado.** 375 px sem rolagem lateral, e dá para navegar tudo sem mouse.

## Como vai funcionar

```
┌──────────────────────────────┐        ┌────────────────────────────────┐
│ lordcarvel.github.io         │ fetch  │ API (Java, hospedada à parte)  │
│ Vite + React + TS, estático  │ ─────► │  contrato OpenAPI único        │
│                              │        │  ├─ impl. 1: carvel-http       │
│ registro de buffers          │        │  │   + Cdatra + banco          │
│ ├─ árvore, abas, rotas       │        │  └─ impl. 2: Spring Boot       │
│ ├─ busca Ctrl+K              │        │                                │
│ └─ shell + FS virtual        │        │ HTTPS: proxy (Caddy) na frente │
│                              │        └────────────────────────────────┘
│ plano B local p/ cada recurso│ ◄── se a API falhar ou demorar
└──────────────────────────────┘
```

### O front

**Stack:** Vite + React + TypeScript, ESLint e Vitest. O deploy é pelo GitHub Actions no GitHub Pages.

Escolhi React porque é o que mais aparece nas vagas de front e fullstack. Mas não quero que vire um app de tutorial cheio de biblioteca. O roteador por hash, o i18n, o shell e a busca eu escrevo na mão. Só coloco uma lib nova quando ela resolver algo que não vale a pena eu reimplementar.

O TypeScript está fixado em `~6.0.x` porque o `typescript-eslint` 8 ainda não aceita o 7. Quando ele passar a aceitar, eu volto para o 7.

**O coração é o registro de buffers.** Cada página é um objeto que se registra uma vez. A árvore, as abas, as rotas, a busca e o shell leem desse registro, então uma página nova aparece em todos eles sem eu mexer em mais nada. O registro é TS puro: não depende de React e eu consigo testar sem DOM.

```ts
type Localized<T = string> = { pt: T; en: T };

interface Buffer {
  id: string;                         // rota: #/sobre
  name: Localized;                    // nome do arquivo: sobre.md / about.md
  dir?: string;                       // pasta virtual: 'projetos'
  title: Localized;                   // título nas duas línguas
  keywords?: string;                  // para a busca
  lines: (lang: Lang) => Line[];      // fonte única: <Doc>, cat e grep usam isto
  Component?: React.ComponentType;    // só para as páginas interativas (demos)
}
```

No protótipo, o `cat` e o `grep` renderizavam a página escondida e liam o `innerText`. Era gambiarra. Aqui o `lines()` é uma função pura que sai dos dados: o `<Doc lines={…} />` desenha e o terminal lê as mesmas linhas.

**Estado global sem biblioteca:** idioma, tema, buffer aberto e abas ficam em Contexts (`LangProvider`, `ThemeProvider`, `EditorProvider`). Se crescer demais, `useReducer` resolve antes de eu precisar de Redux ou Zustand.

**A regra que eu não posso esquecer:** lógica em `.ts` puro (registro, router, `resolvePath`, parser do shell, `parseEntity`, `matchJob`), com teste de unidade. Os `.tsx` só montam a tela e chamam essa lógica.

| Onde | O que faz |
|---|---|
| `core/registry.ts` | `register()`, `get()`, `all()` sobre um `Map` (TS puro) |
| `core/router.ts` + `hooks/useHashRoute.ts` | hash → buffer, `hashchange`, voltar e avançar do navegador |
| `components/Doc.tsx` | linhas numeradas com `counter()` no CSS |
| `components/` | a moldura: `Tabs`, `FileTree`, `Editor`, `Terminal`, `StatusBar`, `Palette` |
| `context/` | `LangProvider`, `ThemeProvider`, `EditorProvider` (buffer aberto, abas, `runCommand`) |
| `i18n/` | idioma atual (`?lang=`, depois `localStorage`, depois o navegador), `tr()`, `loc()`, `useLang()` |
| `data/` | perfil, stack, projetos, contatos e produtos, tudo tipado |
| `themes/` | 3 ou 4 temas, cada um um mapa de variáveis CSS |
| `services/github.ts` | API pública do GitHub com cache de 15 min no `sessionStorage` |
| `services/api.ts` | cliente da minha API: timeout, health check, plano B e escolha da implementação |
| `terminal/` | parser, FS virtual, `resolvePath()`, comandos, pipes, Tab (TS puro) |
| `palette/` | pontuação da busca por subsequência (TS puro); a caixa é um componente |
| `demos/` | ORM (Cdatra), comanda (Easy Hub) e comparador de vaga: lógica `.ts` + componente `.tsx` |
| `pages/` | cada página registra o seu buffer |

### O back

O backend fica em **repositórios separados**. Cada um conta como projeto no meu GitHub, com README, testes e CI próprios.

| Repositório (nome provisório) | O que é |
|---|---|
| `carvel-http` | meu servidor HTTP/1.1 em Java puro, como biblioteca que eu possa reaproveitar |
| `portfolio-api` | a API do portfolio: `carvel-http` + Cdatra + banco |
| `portfolio-api-spring` | a mesma API em Spring Boot, seguindo o mesmo contrato |

Não gosto muito do Spring Boot, mas quero mostrar que sei usar. A saída é **um contrato e duas implementações**. O OpenAPI é a fonte da verdade, e uma suíte de testes de contrato roda contra as duas e garante que elas respondem igual. No site, um seletor discreto escolhe qual backend responde (`?api=core` ou `?api=spring`), e a barra de status mostra qual está ativo.

**Endpoints da primeira versão:**

| Rota | Para quê | Plano B no site |
|---|---|---|
| `GET /health` | status, versão, implementação e latência | esconde o seletor e usa só o local |
| `POST /orm/generate` | entidade Java → SQL gerado pelo Cdatra de verdade, com diagnósticos | simulação em TS, com o aviso "simulação" |
| `POST /contact` | mensagem com validação, limite de requisições e gravação via Cdatra | mostra o e-mail e o botão de copiar |
| `GET /products` | catálogo dos projetos que eu estiver vendendo | lista fixa em `src/data` |

Depois, se fizer sentido: visitas, livro de visitas, status dos projetos.

**HTTPS:** o `carvel-http` fala HTTP puro e o TLS fica com o Caddy na frente, que gera e renova o certificado sozinho. Escrever meu próprio TLS não compensa o risco. Se eu quiser mostrar que entendo, coloco o `SSLServerSocket` do JDK como opção extra, fora do caminho de produção.

**O que qualquer implementação precisa ter:** CORS só para `lordcarvel.github.io` e `localhost`, limite de requisições por IP, tamanho máximo de corpo, validação de entrada, logs estruturados e erros em JSON sempre no mesmo formato.

## Onde fica cada coisa

```
LordCarvel.github.io/
├── docs/GUIA.md
├── referencia/prototipo/      protótipo antigo (apagar antes da v0.0.1)
├── index.html                 moldura + conteúdo essencial estático + og:tags
├── public/                    curriculo.pdf, og-image.png, favicon
├── src/
│   ├── App.tsx / Main.tsx     entrada (createRoot) e componente raiz
│   ├── components/  context/  hooks/
│   ├── core/  i18n/  data/  themes/  services/
│   ├── terminal/  palette/  demos/  pages/
│   └── styles/                base, layout, temas, impressão
├── *.test.ts ao lado do código testado
├── eslint.config.js
├── vite.config.ts             base: '/' (padrão)
└── .github/workflows/deploy.yml   lint → test → build → Pages
```

## Passo a passo

Cada etapa termina com algo funcionando, e eu faço um commit no fim de cada uma. Se algo quebrar, volto para a última versão boa. No front a ordem importa, porque cada etapa usa a anterior. O back eu vou tocando em paralelo, quando quiser escrever Java, e as duas trilhas se encontram na F12.

### Front

**F1. Projeto e deploy.** ✅ Vite com o template `react-ts` e ESLint, `.gitattributes` com `eol=lf`, Vitest com um teste bobo e o workflow do Pages publicando um "olá".
- Conferir: o push na `main` passa por lint, teste e build, e publica sozinho.

**F2. Moldura e cores.** Os componentes `Tabs`, `FileTree`, `Editor`, `Terminal` e `StatusBar`, com dados escritos à mão. CSS Grid com `grid-template-areas` e `height: 100dvh`. Todas as cores em `:root`.
- Conferir: só o editor rola, a página não. Trocar `--accent` no DevTools muda tudo que é verde.

**F3. Dados tipados e i18n básico.** `Localized<T>`, a pasta `data/` com perfil, stack e projetos, mais `tr()` e `loc()`. Os textos já nascem nas duas línguas.
- Conferir: o TypeScript reclama se faltar o `en` em algum campo.

**F4. Buffers e rotas.** Registro, router com `useHashRoute`, `<Doc>` com linhas numeradas e `lines()` como fonte única.
- Conferir: `#/sobre` abre a página certa e o voltar do navegador funciona. O router tem testes.

**F5. Páginas e HTML estático.** Perfil (com os 4 atalhos), sobre, stack, projetos, uma página por projeto, contato e currículo. Árvore e abas geradas pelo registro. O essencial e as tags `og:` no `index.html`.
- Conferir: adicionar um projeto em `data/` faz ele aparecer na árvore, na lista e na busca. O link no LinkedIn mostra título e imagem.

**F6. GitHub ao vivo.** Repositórios, último push e gráfico de 30 dias, com cache e plano B.
- Conferir: sem internet, o site continua inteiro.

**F7. Terminal básico.** Entrada, histórico com as setas, `help` e `clear`. Um componente `<Cmd run="match" />` gera os comandos clicáveis e chama o `runCommand` do contexto.

**F8. FS virtual e comandos.** Primeiro o `resolvePath()`, depois `ls`, `cd`, `pwd`, `cat`, `tree`, `grep`, `find`, `head`, `wc` e `man`, nessa ordem. Depois Tab, pipes, `sort` e `tail`.
- Conferir: `cd projetos`, `ls`, `cd ..`, `grep java | head -3`. O `resolvePath` e o parser de pipes têm testes.

**F9. Busca Ctrl+K.** Pontuação por subsequência, com setas e Enter.
- Conferir num navegador comum, porque no protótipo o atalho não respondia dentro do painel de um app.

**F10. Demos locais.**
1. ORM: parser de entidade em TS como plano B, com o aviso "simulação".
2. Comparador de vaga: mostra o encaixe e a prova em cada projeto, **sem lista do que falta**.
3. Comanda: 58 e 80 mm, com a animação de impressão.
- Conferir no ORM: apagar o `@Id` mostra o erro e escrever `columnName` mostra o aviso. O `parseEntity` e o `matchJob` têm testes.

**F11. Temas e idioma completo.** 3 ou 4 temas (um escuro, um claro e um ou dois favoritos), com prévia ao vivo na tecla T. Inglês revisado.
- Conferir: contraste AA em todos os temas.

**F12. Ligar na API.** `services/api.ts` com timeout, health check, seletor de implementação e plano B. Enquanto o back não existir, uso um mock gerado a partir do contrato.
- Conferir: com a API desligada, tudo funciona no modo local. Com ela ligada, o ORM mostra "gerado pelo Cdatra real".

**F13. Acabamento.** Gaveta no celular, CSS de impressão do currículo, `prefers-reduced-motion`, foco visível, `aria-label` e Lighthouse.
- Conferir: 375 px sem rolagem lateral, navegação inteira só com teclado e Lighthouse ≥ 90 em tudo.

**F14. Lançar a v0.0.1.** Dados reais conferidos (seção 7), `referencia/` apagada, tag `v0.0.1`, link na bio e no README do GitHub, GIF no README.

### Back (repositórios separados)

**B1. Contrato.** `openapi.yaml` com os endpoints de cima e um formato único de erro. Com isso o front já consegue usar o mock.

**B2. `carvel-http`.** Sockets, parser de HTTP/1.1 (linha de requisição, headers, corpo com `Content-Length` e chunked), roteador, keep-alive, timeouts e pool de threads (ou virtual threads). Tudo com teste.

**B3. `portfolio-api` com Cdatra.** Endpoints implementados, banco e validação.

**B4. Robustez.** CORS, limite de requisições, limite de corpo, logs e tratamento de erros.

**B5. Deploy.** Container, Caddy na frente com HTTPS, e CI rodando os testes e os testes de contrato.

**B6. `portfolio-api-spring`.** A mesma API em Spring Boot, passando nos mesmos testes de contrato.

## O que conta como v0.0.1

Do front, F1 a F14. Do back, pelo menos B1 a B5. A versão Spring (B6) pode vir numa v0.0.x seguinte, porque o site funciona com uma implementação só.

## Antes de lançar

**Trocar o que é fantasia no protótipo**
- [ ] E-mail real
- [ ] LinkedIn real
- [ ] Currículo PDF real
- [ ] Revisar os textos em inglês

**Ainda preciso decidir**
- [ ] Banco da API (PostgreSQL, SQLite ou outro que o Cdatra suporte)
- [ ] Onde hospedar a API (ver os planos gratuitos e baratos quando chegar no B5)
- [ ] Domínio próprio para a API (tipo `api.<dominio>`)
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
| Arquivos | `ls [-la]`, `cd`, `pwd`, `cat`, `open` (`vim`, `code`), `tree`, `grep`, `find`, `head`, `wc` |
| Portfolio | `about`/`sobre`, `projects`/`projetos`, `stack`, `match`/`vaga`, `orm`, `order`/`comanda`, `activity`, `resume`/`curriculo`, `contact`/`contato`, `shop`/`loja` |
| Sistema | `help`, `theme`/`tema`, `lang`, `api` (status e troca de implementação), `fullscreen`, `neofetch`, `man`, `history`, `clear`, `echo`, `whoami`, `date`, `uname -a`, `git log`, `git status`, `exit` |
| Pipes | `grep`, `head -n N`, `tail`, `wc`, `sort` (ex.: `grep java \| head -3`) |
| Segredos | `cat .segredo`, `sudo contratar`, `rm`, `whatsapp`, `copy-phone` |

**Coisas que já me morderam (ou vão morder)**

- **Nomes que sombreiam APIs do navegador:** evitar `print`, `history`, `open`, `close` e `name`, mesmo dentro de módulo, porque um import esquecido faz o código usar a global sem avisar. No terminal, usar `termPrint` e `cmdHistory`.
- **Nomes de arquivo:** componente em PascalCase (`FileTree.tsx`), o resto em camelCase (`resolvePath.ts`). Nunca trocar só a caixa de um nome no Windows: renomear em dois passos ou usar `git mv`, porque o CI roda em Linux e lá `main` e `Main` são arquivos diferentes.
- **Fim de linha:** o `.gitattributes` com `eol=lf` já resolve. Não mexer.
