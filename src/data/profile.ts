import type { Localized } from '../i18n/lang'

export type Profile = {
  name: string
  githubUser: string
  role: Localized
  tagline: Localized
  lookingFor: Localized
  location: Localized
  about: Localized<string[]>
  links: {
    github: string
    /** Fica de fora enquanto não houver o dado real: campo ausente some do site. */
    email?: string
    linkedin?: string
    cv?: string
  }
}

export const profile: Profile = {
  name: 'Carvel',
  githubUser: 'LordCarvel',
  role: { pt: 'Desenvolvimento backend', en: 'Backend development' },
  tagline: {
    pt: 'Java, dados e aplicações para o dia a dia.',
    en: 'Java, data and apps for everyday work.',
  },
  lookingFor: {
    pt: 'Vagas de desenvolvimento backend com Java',
    en: 'Open to Java backend developer roles',
  },
  location: { pt: 'Penha, SC', en: 'Penha, SC, Brazil' },
  about: {
    pt: [
      'Sou o Carvel. Meu foco é backend com Java.',
      'Gosto de construir ferramentas que resolvem problemas que eu conheço de perto.',
      'Pedidos, impressão, entregas e caixa: foi com essas rotinas que vários dos meus projetos ganharam forma.',
      'No Cdatra, aprofundo Java, persistência e testes. Nos apps, conecto interface, dados e uso no dia a dia.',
    ],
    en: [
      "I'm Carvel. My focus is backend development with Java.",
      'I like building tools that solve problems I know firsthand.',
      'Orders, printing, deliveries and cash closing: many of my projects grew out of those daily routines.',
      'In Cdatra I go deep into Java, persistence and testing. In the apps I connect UI, data and real-world use.',
    ],
  },
  links: {
    github: 'https://github.com/LordCarvel',
  },
}
