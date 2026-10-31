import { describe, expect, it } from 'vitest'
import type { GameView } from '@/modules/dungeon/contracts'
import { createTestApi } from './testing'

/** Vue d'une expédition renvoyée par l'API du Donjon. */
async function gameOf(res: Response) {
  return (await res.json()) as { gameId: string; view: GameView }
}

describe('Forge et Donjon - équipement des héros (bonus B6)', () => {
  it('renforce le héros du joueur qui porte un objet forgé, et pas celui des autres', async () => {
    const api = await createTestApi()
    for (const player of ['alice', 'bob']) {
      await api.post('/api/realm/village', { name: `Village de ${player}` }, player)
    }
    // Alice forge, retire et porte un heaume cornu commun : +2 en défense.
    await api.post('/api/forge/orders', { recipe: 'hornedHelm' })
    api.advance(2)
    await api.post('/api/forge/collect', {})
    await api.post('/api/forge/equip', { itemId: 'item-1' })

    const { gameId, view } = await gameOf(
      await api.post('/api/dungeon/games', { difficulty: 'easy' }),
    )
    expect(view.heroes[0]).toMatchObject({ id: 'alice', maxHp: 32 })

    // Bob, qui n'a rien forgé, rejoint l'expédition avec les caractéristiques de départ.
    const joined = await api.post(`/api/dungeon/games/${gameId}/join`, {}, 'bob')
    const heroes = ((await joined.json()) as { view: GameView }).view.heroes
    expect(heroes.find((hero) => hero.id === 'bob')).toMatchObject({ maxHp: 30 })
  })
})
