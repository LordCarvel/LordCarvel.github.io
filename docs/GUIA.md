# Portfolio Carvel: guia do projeto

> Versão 2, revisada em 4 de nov. de 2026. Substitui o guia original de 3 de nov., que foi feito com o protótipo `portfolio-prototipo/`.

## 1. Visão geral

Um portfolio com cara de editor Neovim e terminal. Ele precisa servir a dois públicos:

- **Recrutador:** entende em menos de um minuto quem é o Carvel e o que ele constrói, sem saber nenhum comando.
- **Dev ou tech lead:** encontra profundidade técnica de verdade (arquitetura, testes, um backend próprio em Java).

**Objetivo:** vagas de **front-end, backend e fullstack**. O site é uma peça de front-end por si só, e conversa com um backend Java que também entra no portfolio.

**Horizonte:** o portfolio é de longo prazo. Ele cresce junto com outros projetos, inclusive os que forem vendidos. A meta é começar a aplicar para vagas em **fev/mar de 2027**.

**Lançamento:** a primeira versão pública é a **v0.0.1** e sai completa (seção 6). Até lá, o trabalho anda por marcos internos, com deploys de teste desde o começo.

### Dois jeitos de navegar, e qualquer um basta

- **Clicando:** árvore de arquivos, abas, quatro atalhos grandes na página inicial (teclas 1 a 4), comandos clicáveis.
- **Digitando:** shell com sistema de arquivos virtual (`cd`, `ls -la`, `cat`, `grep`, pipes).

## 2. Princípios (valem para qualquer decisão)

1. **O recrutador acha o que precisa sem digitar nenhum comando.** Tudo que o terminal faz também tem botão ou link.
2. **O site funciona sem o backend.** A API é um bônus. Se ela cair, cada recurso tem um plano B local.
3. **Conteúdo só em `src/data`.** Nenhum texto escrito direto na interface.
4. **Todo texto já nasce em `{ pt, en }`.** O inglês pode ficar provisório, mas a estrutura vem desde a etapa 3.
5. **Cores só por variáveis CSS.** Nenhuma cor fixa fora de `:root` e dos temas.
6. **O essencial está no HTML estático.** Nome, cargo, resumo e tags `og:` ficam no `index.html`, para o LinkedIn, o WhatsApp e o Google lerem sem rodar JS.
7. **Mostre o encaixe, não as lacunas.** Nada no site lista o que o Carvel ainda não sabe.
8. **Demo honesta.** Quando algo for simulação local, a página diz isso e aponta para o código real.
9. **Mobile 375 px sem rolagem lateral, e navegação completa só com teclado.**

## 3. Arquitetura

```
┌──────────────────────────────┐        ┌────────────────────────────────┐
│ lordcarvel.github.io         │ fetch  │ API (Java, hospedada à parte)  │
│ Vite + TypeScript, estático  │ ─────► │  contrato OpenAPI único        │
│                              │        │  ├─ impl. 1: carvel-http       │
│ registro de buffers          │        │  │   + Cdatra + banco          │
│ ├─ árvore, abas, rotas       │        │  └─ impl. 2: Spring Boot       │
│ ├─ busca Ctrl+K              │        │                                │
│ └─ shell + FS virtual        │        │ HTTPS: proxy (Caddy) na frente │
│                              │        └────────────────────────────────┘
│ plano B local p/ cada recurso│ ◄── se a API falhar ou demorar
└──────────────────────────────┘
```

### 3.1 Frontend

**Stack:** Vite + TypeScript (modelo `vanilla-ts`), sem framework de UI. Testes com Vitest. Deploy pelo GitHub Actions no GitHub Pages.

Por que sem React/Vue: o projeto mostra que você domina DOM, eventos, roteamento e arquitetura sem depender de framework. Se uma vaga pedir React, um projeto paralelo cobre isso.

**O núcleo é o registro de buffers.** Cada página é um objeto que se registra uma vez. A árvore, as abas, as rotas, a busca e o shell leem esse registro, então uma página nova aparece em todos eles sem código extra.

```ts
type Localized<T = string> = { pt: T; en: T };

interface Buffer {
  id: string;                    // rota: #/sobre
  name: Localized;               // nome do arquivo: sobre.md / about.md
  dir?: string;                  // pasta virtual: 'projetos'
  title: () => string;           // já no idioma atual
  keywords?: string;             // para a busca
  lines: () => Line[];           // FONTE ÚNICA: render, cat e grep usam isto
  render?: () => HTMLElement;    // só para páginas com blocos interativos
}
```

Diferença para o protótipo: lá, `cat` e `grep` renderizavam a página fora da tela e liam o `innerText`. Aqui, `lines()` sai dos dados. `doc(lines)` monta o visual e o terminal lê as mesmas linhas, sem gambiarra e fácil de testar.

**Outros módulos:**

| Módulo | Responsabilidade |
|---|---|
| `core/registry.ts` | `register()`, `get()`, `all()`, sempre a partir de um `Map` |
| `core/router.ts` | hash → buffer, `hashchange`, voltar/avançar do navegador |
| `core/doc.ts` | linhas numeradas por `counter()` no CSS |
| `core/events.ts` | barramento simples (`lang:change`, `theme:change`, `buffer:open`) |
| `i18n/` | idioma atual (`?lang=`, depois `localStorage`, depois o navegador), `tr()`, `loc()` |
| `data/` | perfil, stack, projetos, contatos, produtos, tudo tipado |
| `themes/` | 3 ou 4 temas, cada um um mapa de variáveis CSS |
| `services/github.ts` | API pública do GitHub com cache de 15 min no `sessionStorage` |
| `services/api.ts` | cliente da API própria: timeout, health check, plano B, escolha da implementação |
| `terminal/` | parser, FS virtual, `resolvePath()`, comandos, pipes, completar com Tab |
| `palette/` | busca Ctrl+K por subsequência e seletor de temas |
| `demos/` | ORM (Cdatra), comanda (Easy Hub), comparador de vaga |
| `pages/` | cada página registra seu buffer |

### 3.2 Backend

Fica em **repositórios separados**. Cada um é um projeto de portfolio com README, testes e CI próprios.

| Repositório (sugestão) | O que é |
|---|---|
| `carvel-http` | servidor HTTP/1.1 próprio em Java puro, como biblioteca reaproveitável |
| `portfolio-api` | a API do portfolio: `carvel-http` + Cdatra + banco |
| `portfolio-api-spring` | a mesma API em Spring Boot, seguindo o mesmo contrato |

**Um contrato, duas implementações.** O contrato OpenAPI é a fonte da verdade. Uma suíte de **testes de contrato** roda contra as duas implementações e garante que elas respondem igual. No site, um seletor discreto escolhe qual backend responde (`?api=core` ou `?api=spring`), e a barra de status mostra qual está ativo.

**Endpoints do contrato (primeira versão):**

| Método e rota | Para quê | Plano B no site |
|---|---|---|
| `GET /health` | status, versão, implementação, latência | esconde o seletor e usa só o local |
| `POST /orm/generate` | entidade Java → SQL gerado pelo Cdatra real, mais diagnósticos | simulação local em TS, com aviso "simulação" |
| `POST /contact` | mensagem com validação, limite de requisições e gravação via Cdatra | mostra o e-mail e o botão de copiar |
| `GET /products` | catálogo dos projetos à venda | lista fixa em `src/data` |

Depois, se fizer sentido: visitas, livro de visitas, status dos projetos.

**HTTPS:** o `carvel-http` fala HTTP puro. O TLS fica com um proxy na frente (Caddy, que gera e renova o certificado sozinho) ou com a plataforma de hospedagem. Escrever o próprio TLS não compensa o risco. Como extra didático, dá para oferecer `SSLServerSocket` do JDK como opção, mas fora do caminho de produção.

**Requisitos de qualquer implementação:** CORS só para `lordcarvel.github.io` e `localhost`, limite de requisições por IP, tamanho máximo de corpo, validação de entrada, logs estruturados, erros em JSON com formato único.

## 4. Estrutura de pastas do frontend

```
LordCarvel.github.io/
├── docs/GUIA.md
├── referencia/prototipo/      protótipo original (apagar antes da v0.0.1)
├── index.html                 moldura + conteúdo essencial estático + og:tags
├── public/                    curriculo.pdf, og-image.png, favicon
├── src/
│   ├── main.ts
│   ├── core/  i18n/  data/  themes/  services/
│   ├── terminal/  palette/  demos/  pages/
│   └── styles/                base, layout, temas, impressão
├── tests/ (ou *.test.ts ao lado do código)
├── vite.config.ts             base: '/'
└── .github/workflows/deploy.yml
```

## 5. Passo a passo

Cada etapa termina com algo funcionando e com um commit. Na trilha do frontend, a ordem importa porque cada etapa usa a anterior. A trilha do backend roda em paralelo e as duas se encontram na etapa F12.

### Trilha do frontend

**F1. Projeto e deploy.** `npm create vite@latest` (vanilla-ts), Vitest, um teste bobo, workflow do Pages publicando um "olá".
- Teste: o push na `main` publica sozinho em lordcarvel.github.io.

**F2. Moldura e cores.** Abas, árvore, editor, terminal e barra de status, com dados escritos à mão. CSS Grid com `grid-template-areas` e `height: 100dvh`. Todas as cores em `:root`.
- Teste: só o editor rola, a página não. Trocar `--accent` no DevTools muda tudo que é verde.

**F3. Dados tipados e i18n básico.** `Localized<T>`, `data/` com perfil, stack e projetos, `tr()` e `loc()`. Os textos já nascem nas duas línguas.
- Teste: o TypeScript reclama se faltar o `en` num campo.

**F4. Buffers e rotas.** Registro, router, `doc()` com linhas numeradas, `lines()` como fonte única.
- Teste: `#/sobre` abre a página certa e voltar no navegador funciona. Há testes de unidade para o router.

**F5. Páginas e HTML estático.** Perfil (com os 4 atalhos), sobre, stack, projetos, uma página por projeto, contato, currículo. Árvore e abas geradas pelo registro. Conteúdo essencial e `og:` no `index.html`.
- Teste: adicionar um projeto em `data/` faz ele aparecer na árvore, na lista e na busca. O preview do link no LinkedIn mostra título e imagem.

**F6. GitHub ao vivo.** Repositórios, último push, gráfico de 30 dias, com cache e plano B.
- Teste: sem internet, o site continua inteiro.

**F7. Terminal básico.** Entrada, histórico com setas, `help`, `clear`, botões `data-run` com um listener só.

**F8. FS virtual e comandos.** `resolvePath()`, depois `ls`, `cd`, `pwd`, `cat`, `tree`, `grep`, `find`, `head`, `wc`, `man`, nessa ordem. Depois Tab, pipes, `sort`, `tail`.
- Teste: `cd projetos`, `ls`, `cd ..`, `grep java | head -3`. Há testes de unidade para `resolvePath` e para o parser de pipes.

**F9. Busca Ctrl+K.** Pontuação por subsequência, setas e Enter.
- Teste: funciona num navegador comum (no painel do app, o protótipo não respondia ao teclado).

**F10. Demos locais.**
1. ORM: parser de entidade em TS como plano B, com o aviso "simulação".
2. Comparador de vaga: mostra encaixe e prova por projeto, **sem a lista de lacunas**.
3. Comanda: 58 e 80 mm, animação de impressão.
- Teste do ORM: apagar o `@Id` mostra o erro. Escrever `columnName` mostra o aviso. Há testes de unidade para `parseEntity` e `matchJob`.

**F11. Temas e idioma completo.** 3 ou 4 temas (escuro, claro, mais um ou dois favoritos). Prévia ao vivo com a tecla T. Inglês revisado.
- Teste: contraste AA em todos os temas.

**F12. Integração com a API.** `services/api.ts` com timeout, health check, seletor de implementação e plano B. Antes do backend existir, use um mock gerado a partir do contrato.
- Teste: com a API desligada, tudo continua funcionando no modo local. Com ela ligada, o ORM mostra "gerado pelo Cdatra real".

**F13. Acabamento.** Gaveta no celular, CSS de impressão do currículo, `prefers-reduced-motion`, foco visível, `aria-label`, Lighthouse.
- Teste: 375 px sem rolagem lateral, navegação inteira só com teclado, Lighthouse ≥ 90 em tudo.

**F14. Lançamento v0.0.1.** Dados reais conferidos (seção 7), `referencia/` apagada, tag `v0.0.1`, link na bio e no README do GitHub, GIF no README.

### Trilha do backend (repositórios separados)

**B1. Contrato.** `openapi.yaml` com os endpoints da seção 3.2 e o formato de erro único. O frontend já pode usar o mock.

**B2. `carvel-http`.** Sockets, parser de HTTP/1.1 (linha de requisição, headers, corpo com `Content-Length` e chunked), roteador, keep-alive, timeouts, pool de threads (ou virtual threads). Tudo com testes.

**B3. `portfolio-api` com Cdatra.** Endpoints implementados, banco, validação.

**B4. Robustez.** CORS, limite de requisições, limite de corpo, logs, tratamento de erros.

**B5. Deploy.** Container, Caddy na frente com HTTPS, CI rodando os testes e os testes de contrato.

**B6. `portfolio-api-spring`.** A mesma API em Spring Boot, passando nos mesmos testes de contrato.

## 6. O que é a v0.0.1

A v0.0.1 inclui as etapas F1 a F14 e, do backend, pelo menos B1 a B5. A versão Spring (B6) pode chegar numa v0.0.x seguinte sem bloquear o lançamento, porque o site funciona com uma implementação só.

## 7. Pendências antes do lançamento

**Trocar dados de fantasia do protótipo**
- [ ] E-mail real
- [ ] LinkedIn real
- [ ] Currículo PDF real
- [ ] Textos em inglês revisados

**Decisões em aberto**
- [ ] Banco da API (PostgreSQL, SQLite ou outro que o Cdatra suporte)
- [ ] Hospedagem da API (conferir os planos gratuitos e baratos atuais quando chegar em B5)
- [ ] Domínio próprio para a API (ex.: `api.<dominio>`)
- [ ] JSON no `carvel-http`: parser próprio ou uma lib pequena
- [ ] Telefone: proposta é deixar só no currículo

**Melhorias**
- [ ] `og:image` e `og:title`
- [ ] GIF de 10 s no README
- [ ] Link na bio do GitHub e no README do perfil

## 8. Rodar e publicar

```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run build
```

Publicação: push na `main`. O workflow roda `npm ci && npm test && npm run build` e publica `dist/` no Pages (Settings → Pages → Source: GitHub Actions). Mantenha `base: '/'`, porque o site fica na raiz.

Link em inglês: `https://lordcarvel.github.io/?lang=en`.

## 9. Referência rápida

**Atalhos (fora de campos de texto)**

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

**Cuidado com nomes:** mesmo com módulos, não exporte nada como `print`, `history`, `open` ou `close` para o escopo global. No terminal, use `termPrint` e `cmdHistory`.
