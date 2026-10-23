import { describe, expect, it } from 'vitest'
import { bonusOf, INVENTORY_MAX, MAX_FORGE_LEVEL, RECIPES, upgradeCost } from './catalog'
import {
  decide,
  evolve,
  type ForgeCommand,
  type ForgeState,
  initialState,
  playerIdOf,
  transferIdOf,
} from './forge'
import { requestsFor } from './saga'
import { toView } from './view'

/*
 * Chaque bloc vérifie une règle de la fiche de cadrage (docs/evaluation/fiche-cadrage.md),
 * dans l'ordre de ses numéros.
 */

const T0 = Date.UTC(2026, 0, 1)
const ALICE = 'alice'

/** Applique une commande acceptée ; renvoie le nouvel état, les événements et les demandes. */
function play(state: ForgeState, command: ForgeCommand, now = T0) {
  const decision = decide(state, command, now)
  if (!decision.ok) throw new Error(decision.error.code)
  let current = state
  const requests = []
  for (const event of decision.events) {
    current = evolve(current, event)
    requests.push(...requestsFor(ALICE, event))
  }
  return { state: current, events: decision.events, requests }
}

/** Réponse du Village à un mouvement. */
const reply = (
  no: number,
  outcome: 'withdrawn' | 'refused' | 'deposited',
  missing?: Record<string, number>,
): ForgeCommand => ({
  type: 'RecordTransferResult',
  transferId: transferIdOf(ALICE, no, outcome === 'deposited' ? 'refund' : 'pay'),
  outcome,
  missing,
})

const order = (recipe = 'hornedHelm'): ForgeCommand => ({ type: 'OrderItem', recipe })
const DURATION = RECIPES.hornedHelm.durationMs

// Fabrication payée, en cours : le casque sera prêt à T0 + DURATION.
const paying = play(initialState, order()).state
const forging = play(paying, reply(1, 'withdrawn')).state
// Casque retiré : il est dans l'inventaire.
const collected = play(forging, { type: 'CollectItem' }, T0 + DURATION).state

/** Forge dont l'inventaire contient les objets fabriqués à partir des recettes données. */
function withItems(recipes: string[]): ForgeState {
  let state = initialState
  for (const recipe of recipes) {
    state = play(state, order(recipe)).state
    state = play(state, reply(state.lastNo, 'withdrawn')).state
    state = play(state, { type: 'CollectItem' }, T0 + 10 * 60_000).state
  }
  return state
}

describe('Règle 1 - recette connue', () => {
  it('refuse une recette absente du catalogue', () => {
    expect(decide(initialState, order('excalibur'), T0)).toEqual({
      ok: false,
      error: { code: 'UNKNOWN_RECIPE' },
    })
  })

  it('commande une recette du catalogue, à son coût, et demande au Village de la payer', () => {
    const { state, requests } = play(initialState, order())
    expect(state.current).toMatchObject({ kind: 'item', recipe: 'hornedHelm', status: 'paying' })
    expect(requests).toEqual([
      {
        kind: 'withdraw',
        transferId: 'forge:alice:1:pay',
        playerId: ALICE,
        resources: RECIPES.hornedHelm.cost,
      },
    ])
  })
})

describe('Règle 2 - un objet à la fois', () => {
  it('refuse une commande pendant le paiement, la fabrication, ou tant que l’objet n’est pas retiré', () => {
    const busy = { ok: false, error: { code: 'FORGE_BUSY' } }
    expect(decide(paying, order('steelClaws'), T0)).toEqual(busy)
    expect(decide(forging, order('steelClaws'), T0)).toEqual(busy)
    expect(decide(forging, order('steelClaws'), T0 + DURATION)).toEqual(busy)
  })

  it("accepte une nouvelle commande une fois l'objet retiré", () => {
    expect(decide(collected, order('steelClaws'), T0).ok).toBe(true)
  })
})

describe('Règle 3 - inventaire limité', () => {
  it(`refuse une commande lorsque l'inventaire compte déjà ${INVENTORY_MAX} objets`, () => {
    const full = withItems(Array(INVENTORY_MAX).fill('shadowHood'))
    expect(full.inventory).toHaveLength(INVENTORY_MAX)
    expect(decide(full, order(), T0)).toEqual({
      ok: false,
      error: { code: 'INVENTORY_FULL', max: INVENTORY_MAX },
    })
  })
})

describe('Règle 4 - paiement par le Village', () => {
  it('rejette la commande si le Village refuse le prélèvement, sans rien à compenser', () => {
    const { state, requests } = play(paying, reply(1, 'refused', { stone: 15 }))
    expect(state.current).toBeNull()
    expect(state.refusal).toEqual({ no: 1, missing: { stone: 15 } })
    expect(requests).toEqual([])
    // La forge est libre : le joueur peut commander à nouveau.
    expect(decide(state, order(), T0).ok).toBe(true)
  })

  it('présente au joueur les quantités manquantes', () => {
    const refused = play(paying, reply(1, 'refused', { stone: 15 })).state
    expect(toView(refused, T0).refusal).toEqual({ missing: { stone: 15 } })
  })
})

describe('Règle 5 - durée de fabrication', () => {
  it('commence la fabrication à la confirmation du paiement, pour la durée de la recette', () => {
    const confirmedAt = T0 + 5_000
    const { state } = play(paying, reply(1, 'withdrawn'), confirmedAt)
    expect(state.current).toMatchObject({ status: 'forging', readyAt: confirmedAt + DURATION })
  })

  it("refuse le retrait avant la fin, et l'accepte dès qu'elle est passée", () => {
    expect(decide(forging, { type: 'CollectItem' }, T0 + DURATION - 1)).toEqual({
      ok: false,
      error: { code: 'NOT_READY', readyAt: T0 + DURATION },
    })
    const { state } = play(forging, { type: 'CollectItem' }, T0 + DURATION)
    expect(state.inventory).toEqual([
      expect.objectContaining({ itemId: 'item-1', recipe: 'hornedHelm', quality: 'common' }),
    ])
  })

  it("présente l'objet comme prêt dès l'échéance, sans qu'aucun événement soit enregistré", () => {
    expect(toView(forging, T0 + 1_000).current).toMatchObject({
      status: 'forging',
      remainingMs: DURATION - 1_000,
    })
    expect(toView(forging, T0 + DURATION).current).toMatchObject({
      status: 'ready',
      remainingMs: 0,
    })
  })

  it("refuse le retrait quand rien n'est en fabrication", () => {
    expect(decide(initialState, { type: 'CollectItem' }, T0)).toEqual({
      ok: false,
      error: { code: 'NOTHING_TO_COLLECT' },
    })
    expect(decide(paying, { type: 'CollectItem' }, T0 + DURATION).ok).toBe(false)
  })
})

describe('Règle 6 - annulation remboursée', () => {
  it('annule une fabrication en cours et rembourse intégralement son coût', () => {
    const { state, requests } = play(forging, { type: 'CancelOrder' }, T0 + 1_000)
    expect(state.current).toBeNull()
    expect(requests).toEqual([
      {
        kind: 'deposit',
        transferId: 'forge:alice:1:refund',
        playerId: ALICE,
        resources: RECIPES.hornedHelm.cost,
      },
    ])
  })

  it("refuse d'annuler pendant le paiement, après la fin de la fabrication, ou sans commande", () => {
    const refused = { ok: false, error: { code: 'NOT_CANCELLABLE' } }
    expect(decide(paying, { type: 'CancelOrder' }, T0)).toEqual(refused)
    expect(decide(forging, { type: 'CancelOrder' }, T0 + DURATION)).toEqual(refused)
    expect(decide(collected, { type: 'CancelOrder' }, T0 + DURATION)).toEqual(refused)
  })
})

describe('Règle 7 - équipement', () => {
  const two = withItems(['hornedHelm', 'shadowHood', 'emberClaw'])

  it("équipe un objet de l'inventaire sur l'emplacement de sa recette", () => {
    const { state } = play(two, { type: 'EquipItem', itemId: 'item-3' })
    expect(state.equipped).toMatchObject({ weapon: 'item-3', helmet: null })
  })

  it("remplace l'objet déjà porté sur le même emplacement", () => {
    const first = play(two, { type: 'EquipItem', itemId: 'item-1' }).state
    const { state } = play(first, { type: 'EquipItem', itemId: 'item-2' })
    expect(state.equipped.helmet).toBe('item-2')
  })

  it("refuse un objet qui n'est pas dans l'inventaire", () => {
    expect(decide(two, { type: 'EquipItem', itemId: 'item-99' }, T0)).toEqual({
      ok: false,
      error: { code: 'NOT_IN_INVENTORY' },
    })
  })

  it('vide un emplacement', () => {
    const worn = play(two, { type: 'EquipItem', itemId: 'item-1' }).state
    expect(play(worn, { type: 'UnequipSlot', slot: 'helmet' }).state.equipped.helmet).toBeNull()
    // Vider un emplacement déjà vide n'enregistre rien.
    expect(decide(two, { type: 'UnequipSlot', slot: 'cape' }, T0)).toEqual({ ok: true, events: [] })
  })

  it("additionne les bonus de l'équipement porté", () => {
    let state = play(two, { type: 'EquipItem', itemId: 'item-1' }).state
    state = play(state, { type: 'EquipItem', itemId: 'item-3' }).state
    expect(toView(state, T0).bonuses).toEqual({
      attack: bonusOf('emberClaw', 'common').attack,
      defense: bonusOf('hornedHelm', 'common').defense,
    })
  })
})

describe('Règle 8 - gravure', () => {
  it('grave un nom, sans les espaces de début et de fin', () => {
    const { state } = play(collected, {
      type: 'EngraveItem',
      itemId: 'item-1',
      text: '  Moustache  ',
    })
    expect(state.inventory[0].engraving).toBe('Moustache')
  })

  it('refuse une gravure vide ou trop longue', () => {
    const invalid = { ok: false, error: { code: 'INVALID_ENGRAVING', max: 20 } }
    expect(decide(collected, { type: 'EngraveItem', itemId: 'item-1', text: '   ' }, T0)).toEqual(
      invalid,
    )
    const long = 'x'.repeat(21)
    expect(decide(collected, { type: 'EngraveItem', itemId: 'item-1', text: long }, T0)).toEqual(
      invalid,
    )
  })

  it("refuse de graver un objet absent de l'inventaire", () => {
    expect(decide(forging, { type: 'EngraveItem', itemId: 'item-1', text: 'Griffe' }, T0)).toEqual({
      ok: false,
      error: { code: 'NOT_IN_INVENTORY' },
    })
  })
})

describe('Règle 9 - niveau de la forge', () => {
  it('améliore la forge après le paiement de son coût, qui croît à chaque niveau', () => {
    const ordered = play(initialState, { type: 'UpgradeForge' })
    expect(ordered.requests[0]).toMatchObject({ kind: 'withdraw', resources: upgradeCost(1) })
    const { state } = play(ordered.state, reply(1, 'withdrawn'))
    expect(state).toMatchObject({ level: 2, current: null })
    expect(upgradeCost(2).wood).toBeGreaterThan(upgradeCost(1).wood ?? 0)
  })

  it('laisse la forge à son niveau si le Village refuse le paiement', () => {
    const ordered = play(initialState, { type: 'UpgradeForge' }).state
    expect(play(ordered, reply(1, 'refused', { gold: 3 })).state).toMatchObject({
      level: 1,
      current: null,
    })
  })

  it('refuse une amélioration au niveau maximal, ou pendant une fabrication', () => {
    let state = initialState
    while (state.level < MAX_FORGE_LEVEL) {
      state = play(state, { type: 'UpgradeForge' }).state
      state = play(state, reply(state.lastNo, 'withdrawn')).state
    }
    expect(decide(state, { type: 'UpgradeForge' }, T0)).toEqual({
      ok: false,
      error: { code: 'MAX_LEVEL_REACHED' },
    })
    expect(decide(forging, { type: 'UpgradeForge' }, T0)).toEqual({
      ok: false,
      error: { code: 'FORGE_BUSY' },
    })
  })
})

describe('Règle 10 - qualité des objets', () => {
  it('donne aux objets la qualité du niveau de la forge, et des bonus multipliés', () => {
    let state = play(initialState, { type: 'UpgradeForge' }).state
    state = play(state, reply(1, 'withdrawn')).state
    const { state: ordered } = play(state, order('emberClaw'))
    expect(ordered.current).toMatchObject({ quality: 'sturdy' })
    expect(bonusOf('emberClaw', 'sturdy').attack).toBeGreaterThan(
      bonusOf('emberClaw', 'common').attack,
    )
  })

  it('fige la qualité à la commande : améliorer la forge ne change pas les objets déjà commandés', () => {
    let state = withItems(['hornedHelm'])
    state = play(state, { type: 'UpgradeForge' }).state
    state = play(state, reply(state.lastNo, 'withdrawn')).state
    expect(state.level).toBe(2)
    expect(state.inventory[0].quality).toBe('common')
  })
})

describe('Règle 11 - réponses du Village idempotentes', () => {
  it("ignore une réponse déjà prise en compte : le paiement n'est pas appliqué deux fois", () => {
    expect(decide(forging, reply(1, 'withdrawn'), T0)).toEqual({ ok: true, events: [] })
    expect(decide(collected, reply(1, 'withdrawn'), T0)).toEqual({ ok: true, events: [] })
  })

  it("ignore une réponse qui ne concerne pas le travail en cours, ou l'accusé d'un remboursement", () => {
    expect(decide(paying, reply(7, 'withdrawn'), T0)).toEqual({ ok: true, events: [] })
    const cancelled = play(forging, { type: 'CancelOrder' }, T0 + 1).state
    expect(decide(cancelled, reply(1, 'deposited'), T0)).toEqual({ ok: true, events: [] })
  })

  it("retrouve le joueur à partir de l'identifiant d'un mouvement de la Forge", () => {
    expect(playerIdOf(transferIdOf('u42', 3, 'pay'))).toBe('u42')
    expect(playerIdOf('o1:reserve')).toBeNull()
  })
})
