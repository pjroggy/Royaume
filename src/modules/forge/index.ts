/**
 * Entrée publique « serveur » du module Forge.
 * Avec contracts.ts et ui.tsx, c'est le seul fichier du module qui peut être
 * importé depuis l'extérieur.
 */
import type { EventStore } from '@/platform/event-store/event-store'
import type { ChannelPolicy } from '@/platform/realtime/channel-policy'
import { createForgeApi } from './api'
import { createForgeService } from './application/forge-service'
import { FORGE_STREAM_PREFIX, forgeChannel } from './contracts'
import { createEventStoreForgeRepository } from './infrastructure/event-store-forge-repository'
import { createForgeHandlers } from './messages'
import { createForgePersonalData } from './personal-data'

export interface ForgeModuleDeps {
  /** Journal d'événements de la plateforme. */
  store: EventStore
  /** Distribution de la boîte d'envoi, déclenchée par la Forge après ses commandes et lectures. */
  dispatch: () => Promise<unknown>
  /** Horloge de référence ; l'heure réelle par défaut. */
  clock?: () => number
}

/**
 * Fabrique du module : assemble l'adaptateur, le service, l'API, la règle du canal, les
 * gestionnaires de messages et le contributeur aux droits des joueurs.
 */
export function createForgeModule({ store, dispatch, clock }: ForgeModuleDeps) {
  const repo = createEventStoreForgeRepository(store)
  const service = createForgeService(repo, { dispatch, clock })

  // Règle d'accès au canal temps réel, sur le modèle de celle du Village : un joueur n'écoute
  // que sa propre forge.
  const channelPolicy: ChannelPolicy = {
    prefix: FORGE_STREAM_PREFIX,
    canSubscribe: (channel, userId) => channel === forgeChannel(userId),
  }

  return {
    api: createForgeApi(service),
    channelPolicy,
    handlers: createForgeHandlers(service),
    personalData: createForgePersonalData(service),
    /**
     * Somme des bonus de l'équipement porté par le chat d'un joueur : la lecture que la Forge
     * offre aux autres modules côté serveur (le Donjon, bonus B6). Elle ne distribue pas la
     * boîte d'envoi : c'est une simple lecture.
     */
    gearOf: async (playerId: string) => (await service.peek(playerId)).bonuses,
  }
}

export type { ForgeApi } from './api'
