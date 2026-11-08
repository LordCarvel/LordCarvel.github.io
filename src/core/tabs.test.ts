import { describe, expect, it } from 'vitest'
import { closeTab, openTab } from './tabs'

describe('openTab', () => {
  it('adiciona uma aba nova no fim', () => {
    expect(openTab(['perfil'], 'sobre')).toEqual(['perfil', 'sobre'])
  })

  it('não duplica uma aba que já está aberta', () => {
    expect(openTab(['perfil', 'sobre'], 'sobre')).toEqual(['perfil', 'sobre'])
  })

  it('não altera o array recebido', () => {
    const tabs = ['perfil']
    openTab(tabs, 'sobre')
    expect(tabs).toEqual(['perfil'])
  })

  it('passando do limite, fecha a mais antiga que não seja perfil', () => {
    expect(openTab(['perfil', 'a', 'b'], 'c', 3)).toEqual(['perfil', 'b', 'c'])
  })
})

describe('closeTab', () => {
  it('fecha uma aba que não é a atual sem mudar a atual', () => {
    expect(closeTab(['perfil', 'sobre', 'stack'], 'stack', 'sobre'))
      .toEqual({ tabs: ['perfil', 'sobre'], current: 'sobre' })
  })

  it('fechando a atual, ativa a aba da esquerda', () => {
    expect(closeTab(['perfil', 'sobre', 'stack'], 'sobre', 'sobre'))
      .toEqual({ tabs: ['perfil', 'stack'], current: 'perfil' })
  })

  it('fechando a primeira e atual, ativa a nova primeira', () => {
    expect(closeTab(['perfil', 'sobre'], 'perfil', 'perfil'))
      .toEqual({ tabs: ['sobre'], current: 'sobre' })
  })

  it('nunca fecha a última aba', () => {
    expect(closeTab(['perfil'], 'perfil', 'perfil'))
      .toEqual({ tabs: ['perfil'], current: 'perfil' })
  })

  it('ignora um id que não está aberto', () => {
    expect(closeTab(['perfil'], 'xyz', 'perfil'))
      .toEqual({ tabs: ['perfil'], current: 'perfil' })
  })

  it('não altera o array recebido', () => {
    const tabs = ['perfil', 'sobre']
    closeTab(tabs, 'sobre', 'sobre')
    expect(tabs).toEqual(['perfil', 'sobre'])
  })
})
