import { describe, expect, it } from 'vitest'
import { hash, lookOf, luminance, shade } from './color'

describe('couleurs des dessins', () => {
  it('éclaircit vers le blanc et assombrit vers le noir', () => {
    expect(shade('#808080', 1)).toBe('#ffffff')
    expect(shade('#808080', -1)).toBe('#000000')
    expect(shade('#808080', 0)).toBe('#808080')
  })

  it('mesure la luminance perçue entre 0 et 1', () => {
    expect(luminance('#000000')).toBe(0)
    expect(luminance('#ffffff')).toBeCloseTo(1)
    expect(luminance('#2b2633')).toBeLessThan(0.3)
  })

  it('donne toujours la même allure au même joueur, et des couleurs valides', () => {
    expect(lookOf('joueur-1')).toEqual(lookOf('joueur-1'))
    expect(hash('a')).not.toBe(hash('b'))
    for (const value of Object.values(lookOf('joueur-2'))) expect(value).toMatch(/^#[0-9a-f]{6}$/)
  })
})
