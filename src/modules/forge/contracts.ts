/**
 * Entrée publique « partagée » du module Forge : utilisable par le serveur comme par
 * l'interface. Elle ne contient que des types, des constantes, des schémas de validation et
 * des fonctions pures, sans aucun code propre au serveur.
 */
import { z } from 'zod'
import { ENGRAVING_MAX, SLOTS } from './domain/catalog'

export type { Amounts, Quality, RecipeId, Slot } from './domain/catalog'
export {
  ENGRAVING_MAX,
  INVENTORY_MAX,
  MAX_FORGE_LEVEL,
  QUALITIES,
  RECIPES,
  SLOTS,
} from './domain/catalog'
export type { ForgeError } from './domain/forge'
export type { ForgeView, ItemView } from './domain/view'

/** Préfixe commun aux noms des flux, et des canaux, de toutes les forges. */
export const FORGE_STREAM_PREFIX = 'forge-'

/**
 * Nom du flux qui contient les événements de la forge d'un joueur. C'est aussi le nom de son
 * canal temps réel : écouter ce canal, c'est recevoir les événements de ce flux.
 */
export const forgeStream = (playerId: string) => `${FORGE_STREAM_PREFIX}${playerId}`
export const forgeChannel = forgeStream

/** Sujets des messages adressés à la Forge. */
export const FORGE_TOPICS = {
  /** Réponse du Village à un mouvement de ressources demandé par la Forge. */
  transferResult: 'forge.transfer-result',
} as const

/** Texte qui remplace une gravure à l'effacement du compte de son auteur. */
export const ERASED_ENGRAVING = 'Gravure effacée'

/**
 * Corps attendu pour commander un objet. La recette n'est pas restreinte ici à celles du
 * catalogue : c'est une règle du domaine (règle 1), qui produit une erreur métier.
 */
export const OrderItemInput = z.object({ recipe: z.string().trim().min(1).max(40) })

/** Corps attendu pour équiper un objet de l'inventaire. */
export const EquipItemInput = z.object({ itemId: z.string().min(1).max(40) })

/** Corps attendu pour vider un emplacement. */
export const UnequipSlotInput = z.object({ slot: z.enum(SLOTS) })

/**
 * Corps attendu pour graver un objet. La longueur exacte, après retrait des espaces, est
 * vérifiée par le domaine (règle 8) ; le schéma ne fait que borner la taille de la requête.
 */
export const EngraveItemInput = z.object({
  itemId: z.string().min(1).max(40),
  text: z.string().max(ENGRAVING_MAX * 4),
})
