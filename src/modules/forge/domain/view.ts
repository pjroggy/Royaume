/**
 * Vue de la forge présentée au joueur. Elle est calculée à l'instant de la lecture : la fin
 * d'une fabrication y apparaît dès qu'elle est passée, sans tâche de fond (règle 5).
 */
import {
  type Amounts,
  bonusOf,
  MAX_FORGE_LEVEL,
  type Quality,
  qualityAt,
  RECIPES,
  type RecipeId,
  SLOTS,
  type Slot,
  upgradeCost,
} from './catalog'
import type { ForgeState } from './forge'

export interface ItemView {
  itemId: string
  recipe: RecipeId
  slot: Slot
  quality: Quality
  engraving: string | null
  bonus: { attack: number; defense: number }
  equipped: boolean
}

export interface ForgeView {
  level: number
  maxLevel: number
  /** Coût de la prochaine amélioration ; null au niveau maximal. */
  upgradeCost: Amounts | null
  /** Qualité des objets commandés maintenant. */
  quality: Quality
  recipes: {
    recipe: RecipeId
    slot: Slot
    cost: Amounts
    durationMs: number
    bonus: ItemView['bonus']
  }[]
  current: {
    kind: 'item' | 'upgrade'
    status: 'paying' | 'forging' | 'ready'
    recipe: RecipeId | null
    quality: Quality | null
    readyAt: number | null
    remainingMs: number | null
  } | null
  inventory: ItemView[]
  equipped: Record<Slot, ItemView | null>
  /** Somme des bonus de l'équipement porté. */
  bonuses: { attack: number; defense: number }
  refusal: { missing: Amounts } | null
}

export function toView(state: ForgeState, now: number): ForgeView {
  const equippedIds = new Set(Object.values(state.equipped))
  const inventory: ItemView[] = state.inventory.map((item) => ({
    itemId: item.itemId,
    recipe: item.recipe,
    slot: RECIPES[item.recipe].slot,
    quality: item.quality,
    engraving: item.engraving,
    bonus: bonusOf(item.recipe, item.quality),
    equipped: equippedIds.has(item.itemId),
  }))
  const byId = new Map(inventory.map((item) => [item.itemId, item]))
  const equipped = Object.fromEntries(
    SLOTS.map((slot) => [slot, byId.get(state.equipped[slot] ?? '') ?? null]),
  ) as Record<Slot, ItemView | null>
  const bonuses = Object.values(equipped).reduce(
    (sum, item) => ({
      attack: sum.attack + (item?.bonus.attack ?? 0),
      defense: sum.defense + (item?.bonus.defense ?? 0),
    }),
    { attack: 0, defense: 0 },
  )

  const job = state.current
  let current: ForgeView['current'] = null
  if (job?.kind === 'item') {
    const forging = job.status === 'forging'
    current = {
      kind: 'item',
      status: !forging ? 'paying' : now >= job.readyAt ? 'ready' : 'forging',
      recipe: job.recipe,
      quality: job.quality,
      readyAt: forging ? job.readyAt : null,
      remainingMs: forging ? Math.max(0, job.readyAt - now) : null,
    }
  } else if (job) {
    current = {
      kind: 'upgrade',
      status: 'paying',
      recipe: null,
      quality: null,
      readyAt: null,
      remainingMs: null,
    }
  }

  return {
    level: state.level,
    maxLevel: MAX_FORGE_LEVEL,
    upgradeCost: state.level >= MAX_FORGE_LEVEL ? null : upgradeCost(state.level),
    quality: qualityAt(state.level),
    recipes: (Object.keys(RECIPES) as RecipeId[]).map((recipe) => ({
      recipe,
      slot: RECIPES[recipe].slot,
      cost: RECIPES[recipe].cost,
      durationMs: RECIPES[recipe].durationMs,
      bonus: bonusOf(recipe, qualityAt(state.level)),
    })),
    current,
    inventory,
    equipped,
    bonuses,
    refusal: state.refusal ? { missing: state.refusal.missing } : null,
  }
}
