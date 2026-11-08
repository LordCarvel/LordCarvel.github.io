import type { Localized } from '../i18n/lang'

export type Project = {
  /** Vira a rota: #/cdatra */
  slug: string
  /** Nome do arquivo na árvore. */
  file: string
  /** Nome do repositório em github.com/LordCarvel */
  repo: string
  title: string
  featured?: boolean
  kicker: Localized
  pitch: Localized
  points: Localized<string[]>
  tech: string[]
  demo?: string
}

export const projects: Project[] = [
  {
    slug: 'cdatra',
    file: 'Cdatra.java',
    repo: 'Cdatra',
    title: 'Cdatra',
    featured: true,
    kicker: { pt: 'Persistência em Java', en: 'Java persistence' },
    pitch: { pt: 'Uma classe anotada. Menos JDBC repetitivo.', en: 'One annotated class. Less repetitive JDBC.' },
    points: {
      pt: [
        'Entidades, reflexão e Repository<T> para operações de CRUD.',
        'Funciona com JDBC e com Cloudflare D1: muda só o adapter.',
        'Filtros de consulta, validação de metadados e transações.',
        'Testes com JUnit e H2; cobertura com JaCoCo.',
      ],
      en: [
        'Entities, reflection and Repository<T> for CRUD operations.',
        'Works with JDBC and Cloudflare D1: only the adapter changes.',
        'Query filters, metadata validation and transactions.',
        'Tested with JUnit and H2; coverage with JaCoCo.',
      ],
    },
    tech: ['Java 17', 'JDBC', 'SQL', 'Maven', 'JUnit'],
  },
  {
    slug: 'easy-hub',
    file: 'EasyHub.jsx',
    repo: 'EasyPrintV2',
    title: 'Easy Hub',
    featured: true,
    kicker: { pt: 'Operação de pedidos', en: 'Order operations' },
    pitch: {
      pt: 'Pedidos, comandas e uma operação mais organizada.',
      en: 'Orders, kitchen tickets and a more organized operation.',
    },
    points: {
      pt: [
        'Configuração de modelos e impressão de comandas térmicas.',
        'Interface React e servidor Node.js para compartilhar pedidos.',
        'Aplicação desktop em Electron, distribuída para Windows.',
      ],
      en: [
        'Template setup and thermal printing of kitchen tickets.',
        'React UI and a Node.js server to share orders.',
        'Electron desktop app distributed for Windows.',
      ],
    },
    tech: ['React', 'Node.js', 'SQLite', 'Electron'],
    demo: 'https://lordcarvel.github.io/EasyPrintV2/',
  },
  {
    slug: 'delivery-board',
    file: 'DeliveryBoard.js',
    repo: 'Delivery-Board-V2',
    title: 'Delivery Board',
    kicker: { pt: 'Entregas', en: 'Deliveries' },
    pitch: {
      pt: 'Organização de entregadores e pedidos por rodada.',
      en: 'Organizes couriers and orders by delivery round.',
    },
    points: {
      pt: ['Cadastro de motoboys e agrupamento de pedidos por rodada.', 'Edição por modais, com dados salvos no navegador.'],
      en: ['Courier registry and orders grouped by round.', 'Modal-based editing, with data stored in the browser.'],
    },
    tech: ['JavaScript', 'HTML', 'CSS'],
    demo: 'https://lordcarvel.github.io/Delivery-Board-V2/',
  },
  {
    slug: 'finally-storage',
    file: 'FinallyStorage.js',
    repo: 'Finally-Storage',
    title: 'Finally Storage',
    kicker: { pt: 'Caixa', en: 'Cash register' },
    pitch: { pt: 'Conferência de valores e fechamento diário de caixa.', en: 'Daily cash register checks and closing.' },
    points: {
      pt: ['Totais por entregador e divisão por forma de pagamento.', 'Cálculo automático do total do dia, salvo localmente.'],
      en: ['Totals per courier, split by payment method.', 'Automatic daily total, stored locally.'],
    },
    tech: ['JavaScript', 'HTML', 'CSS'],
    demo: 'https://lordcarvel.github.io/Finally-Storage/',
  },
  {
    slug: 'opsbot',
    file: 'OpsBot.js',
    repo: 'MeuCardapioOpsBot',
    title: 'MeuCardapio OpsBot',
    kicker: { pt: 'Monitoramento', en: 'Monitoring' },
    pitch: { pt: 'Bot de operações e monitoramento no Discord.', en: 'Operations and monitoring bot for Discord.' },
    points: {
      pt: ['Monitoramento e agentes distribuídos para a operação do MeuCardapio.'],
      en: ['Monitoring and distributed agents for the MeuCardapio operation.'],
    },
    tech: ['Node.js', 'JavaScript'],
  },
]
