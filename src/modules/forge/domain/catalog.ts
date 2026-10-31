/**
 * Contenu de la Forge : emplacements, qualités, recettes et valeurs d'équilibrage.
 * Ce fichier ne contient que des données et des calculs purs ; les règles qui les utilisent
 * se trouvent dans forge.ts. Rééquilibrer la Forge ne demande de modifier qu'ici.
 *
 * Les ressources sont désignées par leurs identifiants du Village (wood, stone, gold) : ce sont
 * les noms de son langage publié, que la Forge reprend sans importer le module.
 */

/** Quantités de ressources, par identifiant de ressource du Village. */
export type Amounts = Partial<Record<'wood' | 'stone' | 'gold', number>>

/** Emplacements d'équipement du chat. « as const » permet d'en déduire un type union. */
export const SLOTS = ['helmet', 'armor', 'weapon', 'cape'] as const
export type Slot = (typeof SLOTS)[number]

/** Qualités des objets, de la plus modeste à la plus rare : une par niveau de la forge. */
export const QUALITIES = ['common', 'sturdy', 'rare', 'epic', 'legendary'] as const
export type Quality = (typeof QUALITIES)[number]

/** Coefficient appliqué au bonus de base d'une recette, pour chaque qualité. */
export const QUALITY_FACTOR: Record<Quality, number> = {
  common: 1,
  sturdy: 1.5,
  rare: 2,
  epic: 3,
  legendary: 4,
}

/** Niveau de la forge à la première visite, et niveau maximal. */
export const START_LEVEL = 1
export const MAX_FORGE_LEVEL = QUALITIES.length

/** Nombre maximal d'objets dans l'inventaire. */
export const INVENTORY_MAX = 12

/** Longueur maximale d'une gravure, en caractères. */
export const ENGRAVING_MAX = 20

/** Une recette : l'emplacement de l'objet, son coût, sa durée et son bonus de base. */
export interface Recipe {
  slot: Slot
  cost: Amounts
  durationMs: number
  /** Bonus de base, multiplié par le coefficient de qualité de l'objet forgé. */
  bonus: { attack: number; defense: number }
}

const MINUTE = 60_000

/** Recettes de la Forge : deux par emplacement. */
export const RECIPES = {
  hornedHelm: {
    slot: 'helmet',
    cost: { wood: 60, stone: 40 },
    durationMs: 2 * MINUTE,
    bonus: { attack: 0, defense: 2 },
  },
  shadowHood: {
    slot: 'helmet',
    cost: { wood: 30, gold: 8 },
    durationMs: 1 * MINUTE,
    bonus: { attack: 1, defense: 1 },
  },
  rubyCuirass: {
    slot: 'armor',
    cost: { stone: 120, gold: 10 },
    durationMs: 4 * MINUTE,
    bonus: { attack: 0, defense: 4 },
  },
  sardineMail: {
    slot: 'armor',
    cost: { wood: 140, stone: 40 },
    durationMs: 3 * MINUTE,
    bonus: { attack: 0, defense: 3 },
  },
  emberClaw: {
    slot: 'weapon',
    cost: { wood: 90, gold: 15 },
    durationMs: 4 * MINUTE,
    bonus: { attack: 4, defense: 0 },
  },
  steelClaws: {
    slot: 'weapon',
    cost: { wood: 60, stone: 60 },
    durationMs: 2 * MINUTE,
    bonus: { attack: 3, defense: 0 },
  },
  midnightCape: {
    slot: 'cape',
    cost: { stone: 50, gold: 12 },
    durationMs: 3 * MINUTE,
    bonus: { attack: 1, defense: 2 },
  },
  catnipCape: {
    slot: 'cape',
    cost: { wood: 40, gold: 20 },
    durationMs: 2 * MINUTE,
    bonus: { attack: 2, defense: 1 },
  },
} as const satisfies Record<string, Recipe>
export type RecipeId = keyof typeof RECIPES

/** Vrai si l'identifiant désigne une recette du catalogue (règle 1). */
export const isRecipe = (id: string): id is RecipeId => Object.hasOwn(RECIPES, id)

/** Qualité des objets forgés au niveau donné (règle 10). */
export const qualityAt = (level: number): Quality =>
  QUALITIES[Math.min(Math.max(level, 1), MAX_FORGE_LEVEL) - 1]

/** Bonus d'un objet : bonus de base de sa recette, multiplié par le coefficient de sa qualité. */
export function bonusOf(recipe: RecipeId, quality: Quality) {
  const { attack, defense } = RECIPES[recipe].bonus
  const factor = QUALITY_FACTOR[quality]
  return { attack: Math.round(attack * factor), defense: Math.round(defense * factor) }
}

/**
 * Délai de réponse du Village à un prélèvement (règle 13). Passé ce délai, le joueur peut
 * abandonner un travail resté en attente de paiement. Dans le cas ordinaire, la réponse arrive
 * pendant la requête de commande : seul un message bloqué dans la boîte d'envoi l'atteint.
 */
export const PAYMENT_TIMEOUT_MS = 10 * MINUTE

/** Coût de base de l'amélioration de la forge, multiplié à chaque niveau (règle 9). */
export const UPGRADE_BASE_COST = { wood: 400, stone: 300 } satisfies Amounts
/**
 * Multiplicateur du coût à chaque niveau : 400, 1 200, 3 600 puis 10 800 poissons. Relevé (il
 * valait 2, sur une base de 150) quand les bâtiments du Village sont passés au niveau 20 : la
 * dernière amélioration doit rester un objectif, et non une formalité.
 */
export const UPGRADE_GROWTH = 3

/** Coût de l'amélioration qui fait passer la forge du niveau donné au suivant. */
export function upgradeCost(level: number): Amounts {
  const factor = UPGRADE_GROWTH ** (level - START_LEVEL)
  return { wood: UPGRADE_BASE_COST.wood * factor, stone: UPGRADE_BASE_COST.stone * factor }
}

// ---------------------------------------------------------------------------
// Allure du chat (règle 12)
// ---------------------------------------------------------------------------

/** Silhouettes possibles : chat chevalier ou chaton écuyer. */
export const CAT_KINDS = ['cat', 'kitten'] as const
export type CatKind = (typeof CAT_KINDS)[number]

/** Pelages proposés au joueur, en couleurs « #rrggbb ». */
export const FUR_COLORS = [
  '#d9803a',
  '#8f8a99',
  '#2b2633',
  '#efdcb8',
  '#b8875a',
  '#6e5a4a',
  '#c9c2b8',
] as const

export type FurColor = (typeof FUR_COLORS)[number]

/** Couleurs des yeux proposées au joueur. */
export const EYE_COLORS = ['#ffb23f', '#7cf08f', '#9b6bff', '#7cc8ff', '#ff4d5e'] as const
export type EyeColor = (typeof EYE_COLORS)[number]

/**
 * Allure choisie par le joueur pour son chat. Les types n'admettent que les choix proposés :
 * le compilateur refuse une autre couleur, et le schéma de l'API en déduit les mêmes valeurs.
 */
export interface CatLook {
  kind: CatKind
  fur: FurColor
  eyes: EyeColor
}

/** Gardes de type : vrai si la valeur fait partie des choix proposés. */
export const isCatKind = (value: string): value is CatKind =>
  (CAT_KINDS as readonly string[]).includes(value)
export const isFurColor = (value: string): value is FurColor =>
  (FUR_COLORS as readonly string[]).includes(value)
export const isEyeColor = (value: string): value is EyeColor =>
  (EYE_COLORS as readonly string[]).includes(value)

/**
 * Vrai si l'allure ne contient que des choix proposés par le jeu (règle 12). Les types le
 * garantissent déjà dans le code ; la vérification à l'exécution protège le domaine d'une
 * commande construite sans passer par le compilateur.
 */
export const isValidLook = (look: CatLook) =>
  isCatKind(look.kind) && isFurColor(look.fur) && isEyeColor(look.eyes)
