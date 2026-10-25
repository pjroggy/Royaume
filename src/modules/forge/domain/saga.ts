/**
 * Étapes de la saga de paiement : pour chaque événement de la forge, les demandes à adresser
 * au Village. Le domaine décide de ces demandes ; le service les traduit en messages de la
 * boîte d'envoi, comme pour le Marché (TD9).
 */
import type { Amounts } from './catalog'
import { type ForgeEvent, transferIdOf } from './forge'

/** Demande produite par une étape de la saga. */
export type SagaRequest =
  /** Prélever le coût d'un travail : le Village répond, et la réponse fait progresser la saga. */
  | { kind: 'withdraw'; transferId: string; playerId: string; resources: Amounts }
  /** Rembourser une fabrication annulée : le versement ne peut pas échouer, aucune réponse. */
  | { kind: 'deposit'; transferId: string; playerId: string; resources: Amounts }

/** Demandes déclenchées par un événement de la forge du joueur. */
export function requestsFor(playerId: string, event: ForgeEvent): SagaRequest[] {
  switch (event.type) {
    // 1. Commande d'un objet ou de l'amélioration : prélèvement du coût (étape compensable).
    case 'ItemOrdered':
    case 'UpgradeOrdered':
      return [
        {
          kind: 'withdraw',
          transferId: transferIdOf(playerId, event.data.no, 'pay'),
          playerId,
          resources: event.data.cost,
        },
      ]

    // Compensation : annulation de la fabrication, remboursement intégral (règle 6), ou
    // prélèvement confirmé après l'abandon du travail (règle 13). Les deux utilisent le même
    // identifiant de remboursement : un travail n'est jamais remboursé deux fois.
    // DETTE TECHNIQUE DT-016 (docs/qualite/dette-technique.md) : le remboursement n'attend
    // aucune réponse ; s'il était abandonné, rien ne le signalerait au joueur.
    case 'OrderCancelled':
    case 'LatePaymentRefunded':
      return [
        {
          kind: 'deposit',
          transferId: transferIdOf(playerId, event.data.no, 'refund'),
          playerId,
          resources: event.data.refund,
        },
      ]

    // Les autres événements n'engagent aucun mouvement de ressources ; un paiement refusé
    // n'a rien prélevé, et un paiement abandonné n'est compensé que s'il est confirmé ensuite.
    default:
      return []
  }
}
