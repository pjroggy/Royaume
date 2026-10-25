/**
 * Domaine de la Forge : la forge d'un joueur, ses commandes et son inventaire, selon le modèle
 * decider. L'état d'une commande résume l'avancement de la saga de paiement avec le Village.
 * Ce fichier est écrit en TypeScript pur : il n'importe aucun autre module.
 *
 * Les numéros « règle N » renvoient à la fiche de cadrage (docs/evaluation/fiche-cadrage.md).
 */
import {
  type Amounts,
  type CatLook,
  ENGRAVING_MAX,
  INVENTORY_MAX,
  isRecipe,
  isValidLook,
  MAX_FORGE_LEVEL,
  type Quality,
  qualityAt,
  RECIPES,
  type RecipeId,
  type Slot,
  START_LEVEL,
  upgradeCost,
} from './catalog'

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------

/**
 * Travail en cours sur l'enclume : la fabrication d'un objet, ou l'amélioration de la forge.
 * Un travail attend son paiement (« paying »), puis, pour un objet, est en fabrication
 * (« forging ») jusqu'à son retrait.
 */
export type Job =
  | {
      kind: 'item'
      no: number
      recipe: RecipeId
      /** Qualité figée à la commande : celle du niveau de la forge à cet instant (règle 10). */
      quality: Quality
      cost: Amounts
      status: 'paying' | 'forging'
      /** Fin de la fabrication ; 0 tant que le paiement n'est pas confirmé. */
      readyAt: number
    }
  | { kind: 'upgrade'; no: number; toLevel: number; cost: Amounts; status: 'paying' }

/** Objet de l'inventaire. */
export interface Item {
  itemId: string
  recipe: RecipeId
  quality: Quality
  engraving: string | null
  forgedAt: number
}

export interface ForgeState {
  level: number
  /** Numéro du dernier travail commandé : chaque travail a le sien, et ses propres mouvements. */
  lastNo: number
  current: Job | null
  inventory: Item[]
  /** Objet porté sur chaque emplacement, par identifiant. */
  equipped: Record<Slot, string | null>
  /** Dernier paiement refusé : le travail concerné et les quantités qui manquaient (règle 4). */
  refusal: { no: number; missing: Amounts } | null
  /** Allure du chat choisie par le joueur ; null tant qu'il n'en a choisi aucune (règle 12). */
  look: CatLook | null
}

export const initialState: ForgeState = {
  level: START_LEVEL,
  lastNo: 0,
  current: null,
  inventory: [],
  equipped: { helmet: null, armor: null, weapon: null, cape: null },
  refusal: null,
  look: null,
}

// ---------------------------------------------------------------------------
// Événements
// ---------------------------------------------------------------------------

export type ForgeEvent =
  | {
      type: 'ItemOrdered'
      data: { no: number; recipe: RecipeId; quality: Quality; cost: Amounts; at: number }
    }
  | { type: 'UpgradeOrdered'; data: { no: number; toLevel: number; cost: Amounts; at: number } }
  | { type: 'PaymentConfirmed'; data: { no: number; at: number } }
  | { type: 'PaymentRefused'; data: { no: number; missing: Amounts; at: number } }
  | { type: 'ForgeUpgraded'; data: { no: number; level: number; at: number } }
  | { type: 'OrderCancelled'; data: { no: number; refund: Amounts; at: number } }
  | { type: 'ItemCollected'; data: { no: number; itemId: string; at: number } }
  | { type: 'ItemEquipped'; data: { itemId: string; slot: Slot; at: number } }
  | { type: 'SlotEmptied'; data: { slot: Slot; at: number } }
  | { type: 'ItemEngraved'; data: { itemId: string; text: string; at: number } }
  | { type: 'CatCustomized'; data: CatLook & { at: number } }

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------

export type ForgeCommand =
  // Commandes du joueur.
  | { type: 'OrderItem'; recipe: string }
  | { type: 'UpgradeForge' }
  | { type: 'CancelOrder' }
  | { type: 'CollectItem' }
  | { type: 'EquipItem'; itemId: string }
  | { type: 'UnequipSlot'; slot: Slot }
  | { type: 'EngraveItem'; itemId: string; text: string }
  | { type: 'CustomizeCat'; look: CatLook }
  // Commande de la saga, issue d'une réponse du Village dans la boîte d'envoi.
  | {
      type: 'RecordTransferResult'
      transferId: string
      outcome: 'withdrawn' | 'refused' | 'deposited'
      missing?: Amounts
    }

export type ForgeError =
  | { code: 'UNKNOWN_RECIPE' }
  | { code: 'FORGE_BUSY' }
  | { code: 'INVENTORY_FULL'; max: number }
  | { code: 'MAX_LEVEL_REACHED' }
  | { code: 'NOTHING_TO_COLLECT' }
  | { code: 'NOT_READY'; readyAt: number }
  | { code: 'NOT_CANCELLABLE' }
  | { code: 'NOT_IN_INVENTORY' }
  | { code: 'INVALID_ENGRAVING'; max: number }
  | { code: 'INVALID_LOOK' }

export type Decision = { ok: true; events: ForgeEvent[] } | { ok: false; error: ForgeError }

const fail = (error: ForgeError): Decision => ({ ok: false, error })
const accept = (...events: ForgeEvent[]): Decision => ({ ok: true, events })

// ---------------------------------------------------------------------------
// Identifiants
// ---------------------------------------------------------------------------

/** Préfixe des mouvements de ressources demandés par la Forge. */
const TRANSFER_PREFIX = 'forge'

/**
 * Identifiant d'un mouvement de ressources : il est déterminé par le joueur, le numéro du
 * travail et l'étape de la saga, et sert de clé d'idempotence au Village (règle 11). Les
 * identifiants de joueur de Better Auth ne contiennent pas de « : ».
 */
export const transferIdOf = (playerId: string, no: number, step: 'pay' | 'refund') =>
  `${TRANSFER_PREFIX}:${playerId}:${no}:${step}`

/** Joueur dont la forge a demandé un mouvement ; null si l'identifiant n'est pas de la Forge. */
export function playerIdOf(transferId: string): string | null {
  const parts = transferId.split(':')
  return parts.length === 4 && parts[0] === TRANSFER_PREFIX ? parts[1] : null
}

/** Identifiant d'un objet, déduit du numéro du travail qui l'a fabriqué. */
export const itemIdOf = (no: number) => `item-${no}`

// ---------------------------------------------------------------------------
// evolve
// ---------------------------------------------------------------------------

export function evolve(state: ForgeState, event: ForgeEvent): ForgeState {
  switch (event.type) {
    case 'ItemOrdered': {
      const { no, recipe, quality, cost } = event.data
      return {
        ...state,
        lastNo: no,
        current: { kind: 'item', no, recipe, quality, cost, status: 'paying', readyAt: 0 },
      }
    }
    case 'UpgradeOrdered': {
      const { no, toLevel, cost } = event.data
      return {
        ...state,
        lastNo: no,
        current: { kind: 'upgrade', no, toLevel, cost, status: 'paying' },
      }
    }
    case 'PaymentConfirmed': {
      // Seule une fabrication passe par cet événement : la fabrication commence (règle 5).
      const job = state.current
      if (job?.kind !== 'item') return state
      const readyAt = event.data.at + RECIPES[job.recipe].durationMs
      return { ...state, current: { ...job, status: 'forging', readyAt } }
    }
    case 'PaymentRefused':
      return {
        ...state,
        current: null,
        refusal: { no: event.data.no, missing: event.data.missing },
      }
    case 'ForgeUpgraded':
      return { ...state, level: event.data.level, current: null, refusal: null }
    case 'OrderCancelled':
      return { ...state, current: null }
    case 'ItemCollected': {
      const job = state.current
      if (job?.kind !== 'item') return state
      const item: Item = {
        itemId: event.data.itemId,
        recipe: job.recipe,
        quality: job.quality,
        engraving: null,
        forgedAt: event.data.at,
      }
      return { ...state, current: null, refusal: null, inventory: [...state.inventory, item] }
    }
    case 'ItemEquipped':
      return { ...state, equipped: { ...state.equipped, [event.data.slot]: event.data.itemId } }
    case 'SlotEmptied':
      return { ...state, equipped: { ...state.equipped, [event.data.slot]: null } }
    case 'ItemEngraved':
      return {
        ...state,
        inventory: state.inventory.map((item) =>
          item.itemId === event.data.itemId ? { ...item, engraving: event.data.text } : item,
        ),
      }
    case 'CatCustomized': {
      const { kind, fur, eyes } = event.data
      return { ...state, look: { kind, fur, eyes } }
    }
  }
}

export const replay = (events: ForgeEvent[]) => events.reduce(evolve, initialState)

// ---------------------------------------------------------------------------
// decide
// ---------------------------------------------------------------------------

export function decide(state: ForgeState, command: ForgeCommand, now: number): Decision {
  switch (command.type) {
    case 'OrderItem': {
      // Règle 1 : une recette du catalogue.
      if (!isRecipe(command.recipe)) return fail({ code: 'UNKNOWN_RECIPE' })
      // Règle 2 : un seul travail à la fois.
      if (state.current) return fail({ code: 'FORGE_BUSY' })
      // Règle 3 : inventaire limité.
      if (state.inventory.length >= INVENTORY_MAX) {
        return fail({ code: 'INVENTORY_FULL', max: INVENTORY_MAX })
      }
      // Règle 10 : la qualité est celle du niveau de la forge au moment de la commande.
      const recipe = command.recipe
      return accept({
        type: 'ItemOrdered',
        data: {
          no: state.lastNo + 1,
          recipe,
          quality: qualityAt(state.level),
          cost: RECIPES[recipe].cost,
          at: now,
        },
      })
    }

    case 'UpgradeForge':
      // Règle 9 : niveau maximal, et pas pendant un autre travail.
      if (state.level >= MAX_FORGE_LEVEL) return fail({ code: 'MAX_LEVEL_REACHED' })
      if (state.current) return fail({ code: 'FORGE_BUSY' })
      return accept({
        type: 'UpgradeOrdered',
        data: {
          no: state.lastNo + 1,
          toLevel: state.level + 1,
          cost: upgradeCost(state.level),
          at: now,
        },
      })

    case 'CancelOrder': {
      // Règle 6 : seule une fabrication en cours, et pas encore terminée, est annulable.
      const job = state.current
      if (job?.kind !== 'item' || job.status !== 'forging' || now >= job.readyAt) {
        return fail({ code: 'NOT_CANCELLABLE' })
      }
      return accept({ type: 'OrderCancelled', data: { no: job.no, refund: job.cost, at: now } })
    }

    case 'CollectItem': {
      const job = state.current
      if (job?.kind !== 'item' || job.status !== 'forging')
        return fail({ code: 'NOTHING_TO_COLLECT' })
      // Règle 5 : l'objet n'est retiré qu'à la fin de la fabrication. L'échéance est
      // constatée à la commande, sans tâche de fond.
      if (now < job.readyAt) return fail({ code: 'NOT_READY', readyAt: job.readyAt })
      return accept({
        type: 'ItemCollected',
        data: { no: job.no, itemId: itemIdOf(job.no), at: now },
      })
    }

    case 'EquipItem': {
      // Règle 7 : un objet de l'inventaire, sur l'emplacement de sa recette.
      const item = state.inventory.find((i) => i.itemId === command.itemId)
      if (!item) return fail({ code: 'NOT_IN_INVENTORY' })
      const slot = RECIPES[item.recipe].slot
      if (state.equipped[slot] === item.itemId) return accept()
      return accept({ type: 'ItemEquipped', data: { itemId: item.itemId, slot, at: now } })
    }

    case 'UnequipSlot':
      if (state.equipped[command.slot] === null) return accept()
      return accept({ type: 'SlotEmptied', data: { slot: command.slot, at: now } })

    case 'EngraveItem': {
      // Règle 8 : de 1 à ENGRAVING_MAX caractères, espaces de début et de fin retirés.
      if (!state.inventory.some((i) => i.itemId === command.itemId)) {
        return fail({ code: 'NOT_IN_INVENTORY' })
      }
      const text = command.text.trim()
      if (text.length === 0 || [...text].length > ENGRAVING_MAX) {
        return fail({ code: 'INVALID_ENGRAVING', max: ENGRAVING_MAX })
      }
      return accept({ type: 'ItemEngraved', data: { itemId: command.itemId, text, at: now } })
    }

    case 'CustomizeCat': {
      // Règle 12 : une silhouette, un pelage et des yeux choisis parmi ceux du jeu.
      const { kind, fur, eyes } = command.look
      if (!isValidLook({ kind, fur, eyes })) return fail({ code: 'INVALID_LOOK' })
      const same = state.look?.kind === kind && state.look.fur === fur && state.look.eyes === eyes
      if (same) return accept()
      return accept({ type: 'CatCustomized', data: { kind, fur, eyes, at: now } })
    }

    case 'RecordTransferResult':
      return recordTransferResult(state, command, now)
  }
}

/**
 * Réponse du Village à un prélèvement. Seule la réponse attendue pour le travail en cours
 * fait progresser la saga ; toute autre réponse (doublon, réponse tardive, accusé de réception
 * d'un remboursement) est ignorée (règle 11). Le joueur n'est pas vérifié ici : la réponse est
 * adressée au flux de sa forge, désigné par l'identifiant du mouvement.
 */
function recordTransferResult(
  state: ForgeState,
  result: Extract<ForgeCommand, { type: 'RecordTransferResult' }>,
  now: number,
): Decision {
  const job = state.current
  if (job?.status !== 'paying') return accept()
  if (!result.transferId.endsWith(`:${job.no}:pay`)) return accept()

  // Règle 4 : paiement refusé, le travail est abandonné ; rien n'a été prélevé.
  if (result.outcome === 'refused') {
    return accept({
      type: 'PaymentRefused',
      data: { no: job.no, missing: result.missing ?? {}, at: now },
    })
  }
  if (result.outcome !== 'withdrawn') return accept()

  // Paiement confirmé : l'amélioration prend effet aussitôt, la fabrication commence.
  if (job.kind === 'upgrade') {
    return accept({ type: 'ForgeUpgraded', data: { no: job.no, level: job.toLevel, at: now } })
  }
  return accept({ type: 'PaymentConfirmed', data: { no: job.no, at: now } })
}
