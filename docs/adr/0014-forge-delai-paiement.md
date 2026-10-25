# ADR-0014 - Délai de réponse du Village et remboursement d'un prélèvement tardif

- Statut : accepté
- Date : 2026-10-25
- Complète : ADR 0011, sans le remplacer

## Contexte

- La saga de paiement de la Forge (ADR 0011) ne prévoyait aucune issue pour un travail resté
  en attente de paiement. Si le message `realm.withdraw` était abandonné par la boîte d'envoi
  (Village indisponible pendant dix tentatives), la forge refusait toute commande
  (`FORGE_BUSY`), et l'annulation était refusée dans cet état. Seule une relance manuelle du
  message débloquait le joueur. La revue de sécurité de la Forge l'a classé non conforme (F13),
  et la dette DT-015 l'a consigné.
- La Forge ne peut pas savoir si un prélèvement sans réponse a eu lieu. Le message peut
  attendre dans la boîte d'envoi, être relancé plus tard par `scripts/dead-letters.ts`, ou
  avoir été traité par le Village sans que la réponse soit encore remise.
- Sans tâche de fond, une échéance ne peut être constatée qu'à la lecture ou à la commande
  suivante (ADR 0004, ADR 0010).
- Un ADR accepté n'est pas modifié sur le fond : la correction de la saga fait l'objet de cet
  ADR, et l'ADR 0011 reste en vigueur pour tout le reste.

## Décision

- **Délai de réponse.** Un travail en attente de paiement a une échéance, `paymentDueAt`,
  égale à l'instant de sa commande plus `PAYMENT_TIMEOUT_MS` (dix minutes,
  `domain/catalog.ts`). Elle est calculée par `evolve` à partir de l'instant enregistré dans
  `ItemOrdered` ou `UpgradeOrdered`. Aucun événement existant n'est modifié, et les travaux
  déjà enregistrés reçoivent la même échéance.
- **Abandon (règle 13).** Après l'échéance, la commande `CancelOrder` accepte un travail en
  attente de paiement, objet ou amélioration, et enregistre `PaymentAbandoned`, avec son coût.
  La forge est libre. Rien n'est remboursé à ce moment, puisque rien n'a été prélevé à la
  connaissance de la Forge. Avant l'échéance, l'abandon est refusé (`NOT_CANCELLABLE`). La vue
  indique l'échéance et si elle est passée (`paymentDueAt`, `abandonable`), et l'interface
  propose le bouton « Abandonner la commande » à son terme.
- **Seconde compensation.** L'état retient les travaux abandonnés et leur coût. Si le Village
  confirme ensuite le prélèvement d'un travail abandonné (`withdrawn`), la Forge enregistre
  `LatePaymentRefunded`, qui produit un message `realm.deposit`. Ce remboursement a le même
  identifiant (`forge:<joueur>:<travail>:refund`) que celui d'une annulation, et le travail
  quitte la liste : il n'est jamais remboursé deux fois. Un refus tardif n'a aucun effet.
- Une réponse tardive ne s'applique jamais au travail commandé ensuite : elle est reconnue
  par le numéro de travail contenu dans son identifiant de mouvement (`paidNoOf`).

## Conséquences

### Positives

- Une panne du Village ne bloque plus la forge plus de dix minutes, et le joueur ne perd
  jamais de ressources : soit le prélèvement n'a pas lieu, soit il est remboursé.
- Le correctif reste dans le domaine pur de la Forge : le Village et la plateforme ne sont pas
  modifiés.
- Le scénario complet est testé : panne simulée du service Village, abandon, retour du
  service, prélèvement puis remboursement (test « libère la forge après le délai, puis
  rembourse un prélèvement confirmé plus tard »), et cinq tests de la règle 13 sur le domaine.

### Négatives

- Pendant un court instant, le village peut avoir été prélevé alors que le travail est
  abandonné. Le remboursement suit dans la même distribution de la boîte d'envoi, mais la
  cohérence reste différée.
- Le remboursement tardif, comme celui d'une annulation, n'attend aucun accusé (DT-016) : s'il
  était abandonné à son tour, rien ne le signalerait au joueur.
- Deux événements et un élément d'état de plus (`abandoned`). La liste des travaux abandonnés
  n'est jamais purgée d'un travail dont le prélèvement a été refusé. Elle reste petite, puisque
  l'abandon suppose une panne.
- Le délai de dix minutes est arbitraire. Trop court, il pousserait à abandonner des paiements
  sur le point d'aboutir, qui seraient alors remboursés au lieu d'être fabriqués.

## Alternatives écartées

- **Rembourser dès l'abandon** : si le prélèvement n'a jamais eu lieu, le remboursement
  créerait des ressources. La Forge ne sait pas lequel des deux cas s'applique.
- **Envoyer au Village une annulation du prélèvement** : il faudrait un nouveau sujet et une
  nouvelle règle dans le Village, donc modifier un module existant. Et l'annulation pourrait
  arriver avant le prélèvement qu'elle doit annuler.
- **Échéance enregistrée par une tâche de fond** : impossible sur Vercel Hobby (ADR 0010).
- **Relancer automatiquement le message abandonné** : la boîte d'envoi abandonne justement un
  message après dix échecs, pour ne pas insister sur une cause qui n'est pas corrigée.

## Réexamen

- Si des remboursements de la Forge apparaissent parmi les messages abandonnés : traiter
  DT-016 (accusé de réception du remboursement, affiché au joueur).
- Si le délai de dix minutes se révèle trop court ou trop long au regard des pannes réelles.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-25 : conception de la correction avec l'auteur, écriture du
code (`domain/forge.ts`, `domain/saga.ts`, `domain/view.ts`, `ui.tsx`), des cinq tests de la
règle 13 et du test de l'API, et rédaction de cet ADR. Vérification par l'auteur :
`pnpm verify`, relecture du test de panne simulée, et contrôle de l'affichage du bouton
d'abandon.
