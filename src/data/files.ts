// Árvore de arquivos do F3. No F4 o registro de buffers passa a gerar esta árvore.
import { iconFor, type TreeNode } from '../core/tree'
import { projects } from './projects'

export const files: TreeNode[] = [
  { id: 'perfil', name: { pt: 'perfil.md', en: 'profile.md' }, icon: iconFor('perfil.md') },
  { id: 'sobre', name: { pt: 'sobre.md', en: 'about.md' }, icon: iconFor('sobre.md') },
  { id: 'stack', name: { pt: 'stack.toml', en: 'stack.toml' }, icon: iconFor('stack.toml') },
  {
    id: 'projetos',
    name: { pt: 'projetos/', en: 'projects/' },
    icon: iconFor('projetos/'),
    // Um projeto novo em projects.ts já aparece aqui.
    children: projects.map((p) => ({
      id: p.slug,
      name: { pt: p.file, en: p.file },
      icon: iconFor(p.file),
    })),
  },
  { id: 'contato', name: { pt: 'contato.sh', en: 'contact.sh' }, icon: iconFor('contato.sh') },
]
