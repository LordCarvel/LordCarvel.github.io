// Dados provisórios do F2. No F3 os nomes viram { pt, en } e no F4 o registro de buffers substitui este arquivo.
import type { TreeNode } from '../core/tree'

export const mockTree: TreeNode[] = [
  { id: 'perfil', name: 'perfil.md', icon: '#' },
  { id: 'sobre', name: 'sobre.md', icon: '#' },
  { id: 'stack', name: 'stack.toml', icon: '⚙' },
  {
    id: 'projetos',
    name: 'projetos/',
    icon: '▾',
    children: [
      { id: 'cdatra', name: 'cdatra.java', icon: '☕' },
      { id: 'easy-hub', name: 'easy-hub.jsx', icon: '⚛' },
    ],
  },
  { id: 'contato', name: 'contato.sh', icon: '$' },
]

export const mockFrame = {
  root: '~/carvel',
  hire: '● disponível para vagas',
  search: 'buscar',
  terminal: 'terminal · carvel-sh',
  prompt: '~ $',
  branch: 'main',
  mode: 'NORMAL',
}
