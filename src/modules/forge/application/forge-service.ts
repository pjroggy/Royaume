import { REALM_TOPICS } from '@/modules/realm/contracts'
import { withOptimisticRetry } from '@/platform/event-store/retry'
import type { NewMessage } from '@/platform/outbox/outbox'
import { FORGE_TOPICS } from '../contracts'
import type { CatLook, Slot } from '../domain/catalog'
import { decide, type ForgeCommand, type ForgeError, type ForgeEvent } from '../domain/forge'
import { requestsFor, type SagaRequest } from '../domain/saga'
import { type ForgeView, type PublicCat, toPublicCat, toView } from '../domain/view'
import type { ForgeRepository } from './forge-repository'

/** Résultat d'une commande du joueur : la vue de sa forge, ou l'erreur métier. */
export type CommandResult = { ok: true; view: ForgeView } | { ok: false; error: ForgeError }

export interface ForgeServiceOptions {
  /** Distribution de la boîte d'envoi, déclenchée après chaque commande et chaque lecture. */
  dispatch: () => Promise<unknown>
  /** Horloge de référence ; l'heure réelle par défaut. */
  clock?: () => number
}

/** Traduit une demande de la saga en message de la boîte d'envoi, adressé au Village. */
function toMessage(request: SagaRequest): NewMessage {
  const payload = {
    transferId: request.transferId,
    playerId: request.playerId,
    resources: request.resources,
  }
  return request.kind === 'withdraw'
    ? // Adresse de retour : la réponse du Village fera progresser la saga.
      {
        topic: REALM_TOPICS.withdraw,
        payload: { ...payload, replyTo: FORGE_TOPICS.transferResult },
      }
    : // Un versement ne peut pas être refusé : aucune réponse n'est attendue.
      { topic: REALM_TOPICS.deposit, payload }
}

/** Messages déclenchés par une suite d'événements de la forge d'un joueur. */
const messagesFor = (playerId: string, events: ForgeEvent[]) =>
  events.flatMap((event) => requestsFor(playerId, event).map(toMessage))

/**
 * Service applicatif de la Forge : orchestrateur de la saga de paiement avec le Village.
 * Chaque décision est enregistrée avec les messages qu'elle déclenche, dans une même transaction.
 */
export function createForgeService(
  repo: ForgeRepository,
  { dispatch, clock = () => Date.now() }: ForgeServiceOptions,
) {
  /**
   * Décide et enregistre une commande sur la forge d'un joueur, avec les messages de la saga.
   * En cas de conflit de version, l'ensemble est rejoué sur l'état à jour.
   */
  function process(playerId: string, command: ForgeCommand) {
    return withOptimisticRetry(async () => {
      const { state, version } = await repo.load(playerId)
      const decision = decide(state, command, clock())
      if (!decision.ok || decision.events.length === 0) return decision
      await repo.save(playerId, version, decision.events, messagesFor(playerId, decision.events))
      return decision
    })
  }

  /** Vue de la forge d'un joueur, calculée à l'instant présent. */
  async function view(playerId: string) {
    const { state } = await repo.load(playerId)
    return toView(state, clock())
  }

  /**
   * Commande du joueur : la décision est enregistrée, puis la boîte d'envoi distribuée. Dans le
   * cas ordinaire, le Village a déjà répondu lorsque la vue est renvoyée : le joueur voit le
   * paiement accepté ou refusé dès la réponse à sa requête.
   */
  async function execute(playerId: string, command: ForgeCommand): Promise<CommandResult> {
    const decision = await process(playerId, command)
    if (!decision.ok) return decision
    await dispatch()
    return { ok: true, view: await view(playerId) }
  }

  /**
   * Lecture de la forge. La boîte d'envoi est d'abord distribuée : une saga interrompue
   * reprend dès que le joueur consulte sa forge.
   */
  async function getView(playerId: string) {
    await dispatch()
    return view(playerId)
  }

  /**
   * Étape de la saga, déclenchée par une réponse du Village. Une erreur métier y est une
   * anomalie : elle est levée, et le message sera retenté.
   */
  async function step(playerId: string, command: ForgeCommand) {
    const decision = await process(playerId, command)
    if (!decision.ok) throw new Error(`Forge de ${playerId} : ${decision.error.code}`)
  }

  /**
   * Chats des joueurs désignés, tels que les voient les autres joueurs : allure et équipement
   * porté. C'est la lecture que proposent la Taverne et le Donjon pour dessiner les joueurs.
   */
  async function cats(playerIds: string[]) {
    const entries = await Promise.all(
      playerIds.map(async (id) => [id, toPublicCat((await repo.load(id)).state)] as const),
    )
    return Object.fromEntries(entries) as Record<string, PublicCat>
  }

  return {
    getView,
    cats,
    step,
    /** Vue sans distribution de la boîte d'envoi, pour l'export des données personnelles. */
    peek: view,
    order: (playerId: string, recipe: string) => execute(playerId, { type: 'OrderItem', recipe }),
    upgrade: (playerId: string) => execute(playerId, { type: 'UpgradeForge' }),
    cancel: (playerId: string) => execute(playerId, { type: 'CancelOrder' }),
    collect: (playerId: string) => execute(playerId, { type: 'CollectItem' }),
    equip: (playerId: string, itemId: string) => execute(playerId, { type: 'EquipItem', itemId }),
    unequip: (playerId: string, slot: Slot) => execute(playerId, { type: 'UnequipSlot', slot }),
    engrave: (playerId: string, itemId: string, text: string) =>
      execute(playerId, { type: 'EngraveItem', itemId, text }),
    customize: (playerId: string, look: CatLook) =>
      execute(playerId, { type: 'CustomizeCat', look }),
  }
}

/** Type du service, déduit de sa fabrique. */
export type ForgeService = ReturnType<typeof createForgeService>
