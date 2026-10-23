import { describe, expect, it } from 'vitest'
import { nextPreference, parsePreference } from './color-scheme'

describe("Préférence d'affichage", () => {
  it('lit le jour et la nuit, et ramène toute autre valeur au thème du système', () => {
    expect(parsePreference('light')).toBe('light')
    expect(parsePreference('dark')).toBe('dark')
    expect(parsePreference(undefined)).toBe('system')
    expect(parsePreference('<script>')).toBe('system')
  })

  it('passe du thème du système au jour, puis à la nuit, puis revient au système', () => {
    expect(nextPreference('system')).toBe('light')
    expect(nextPreference('light')).toBe('dark')
    expect(nextPreference('dark')).toBe('system')
  })
})
