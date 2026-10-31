import { describe, expect, it } from 'vitest'
import { HERO, NO_GEAR } from './content'
import { initialState, replay } from './game'
import { decide, heroSpec } from './rules'

const T0 = Date.UTC(2026, 0, 1)

/*
 * Bonus B6 : l'équipement forgé par un joueur renforce son héros. Le Donjon reçoit deux
 * nombres (attaque, défense) ; il ne connaît ni les objets ni la Forge.
 */
describe('Donjon - équipement des héros (bonus B6)', () => {
  it('donne au héros sans équipement les caractéristiques de départ', () => {
    expect(heroSpec()).toEqual(HERO)
    expect(heroSpec(NO_GEAR)).toEqual(HERO)
  })

  it("ajoute la moitié du bonus d'attaque, et un point de vie par point de défense", () => {
    expect(heroSpec({ attack: 4, defense: 6 })).toEqual({
      hp: HERO.hp + 6,
      attack: HERO.attack + 2,
    })
  })

  it("plafonne l'effet d'un équipement légendaire, et ignore une valeur négative", () => {
    expect(heroSpec({ attack: 40, defense: 40 })).toEqual({
      hp: HERO.hp + 15,
      attack: HERO.attack + 6,
    })
    expect(heroSpec({ attack: -5, defense: -5 })).toEqual(HERO)
  })

  it("enregistre l'équipement dans l'événement : l'expédition reste rejouable à l'identique", () => {
    const decision = decide(
      initialState,
      {
        type: 'CreateGame',
        playerId: 'alice',
        name: 'Alice',
        difficulty: 'easy',
        seed: 42,
        gear: { attack: 4, defense: 2 },
      },
      T0,
    )
    if (!decision.ok) throw new Error(decision.error.code)
    expect(decision.events[0]).toMatchObject({ data: { hero: { hp: 32, attack: 8 } } })

    const joined = decide(
      replay(decision.events),
      { type: 'JoinGame', playerId: 'bob', name: 'Bob', gear: { attack: 0, defense: 8 } },
      T0,
    )
    if (!joined.ok) throw new Error(joined.error.code)
    expect(joined.events[0]).toMatchObject({ data: { hero: { hp: 38, attack: 6 } } })
  })
})
