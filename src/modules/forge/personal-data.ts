import type { StoredEvent } from '@/platform/event-store/event-store'
import type { PersonalDataContributor } from '@/platform/privacy/privacy'
import type { ForgeService } from './application/forge-service'
import { ERASED_ENGRAVING, forgeStream } from './contracts'

/**
 * Réécriture d'un événement de la Forge sans les données personnelles du joueur : seules les
 * gravures sont un texte libre, saisi par le joueur, et elles sont dans le flux de sa forge.
 * Le reste (recettes, qualités, niveaux) ne décrit que le jeu.
 */
export function redactForgeEvent(event: StoredEvent, playerId: string) {
  if (event.stream !== forgeStream(playerId) || event.type !== 'ItemEngraved') return null
  if (event.data.text === ERASED_ENGRAVING) return null
  return { ...event.data, text: ERASED_ENGRAVING }
}

/**
 * Données personnelles de la Forge : la forge du joueur, son inventaire, son équipement et
 * ses gravures. Ce fichier joue, pour les droits des joueurs, le rôle que jouent api.ts pour les
 * requêtes et messages.ts pour la boîte d'envoi.
 */
export function createForgePersonalData(service: ForgeService): PersonalDataContributor {
  return {
    name: 'forge',

    async export(playerId) {
      const view = await service.peek(playerId)
      return {
        level: view.level,
        inventory: view.inventory.map(({ itemId, recipe, quality, engraving, equipped }) => ({
          itemId,
          recipe,
          quality,
          engraving,
          equipped,
        })),
        current: view.current,
        look: view.look,
      }
    },

    redact: redactForgeEvent,
  }
}
