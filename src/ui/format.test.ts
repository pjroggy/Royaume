import { describe, expect, it } from 'vitest'
import { compact, exact } from './format'

describe('Affichage compact des quantités', () => {
  it('affiche les petites quantités telles quelles, sans décimale', () => {
    expect(compact(0)).toBe('0')
    expect(compact(999.9)).toBe('999')
  })

  it('utilise k pour les milliers et M pour les millions', () => {
    expect(compact(1000)).toBe('1k')
    expect(compact(12_345)).toBe('12,3k')
    expect(compact(245_678)).toBe('245k')
    expect(compact(4_560_000)).toBe('4,5M')
    expect(compact(123_456_789)).toBe('123M')
  })

  it("tronque au lieu d'arrondir : le joueur ne voit jamais plus que ce qu'il possède", () => {
    expect(compact(1999)).toBe('1,9k')
    expect(compact(999_999)).toBe('999k')
  })

  it("donne la valeur exacte, avec séparateur des milliers, pour l'infobulle", () => {
    expect(exact(1_234_567.8)).toBe('1 234 567')
  })
})
