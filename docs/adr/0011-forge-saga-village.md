# ADR-0011 - Paiement des fabrications par une saga orchestrée par la Forge, échangée avec le Village par messages

- Statut : accepté
- Date : 2026-10-25

## Contexte

- Une fabrication et une amélioration de la forge se paient avec les ressources du village du
  joueur. Le stock appartient au Village : seul son domaine peut décider d'un prélèvement
  (stock suffisant ou non), et la Forge ne peut ni lire ni écrire ses données (règle 1 des
  règles d'architecture).
- Le langage publié du Village accepte déjà deux sujets de la boîte d'envoi, `realm.withdraw`
  (avec une adresse de réponse `replyTo`) et `realm.deposit`. Le Village dédoublonne les
  mouvements par leur identifiant (`transferId`). Le Marché les utilise depuis le TD9
  (ADR 0007).
- Le Village peut s'exécuter dans un service autonome (ADR 0009) : un appel de fonction en
  mémoire vers le Village ne fonctionnerait pas dans ce mode.
- La boîte d'envoi garantit une livraison au moins une fois. Un message peut donc être livré
  deux fois, et un message en échec est abandonné après le nombre maximal de tentatives.
- Sans tâche de fond, la boîte d'envoi n'est distribuée que pendant une requête.
- Une annulation doit rembourser intégralement ce qui a été payé (règle 6).

## Décision

- **Orchestration par la Forge.** Le domaine décide, pour chaque événement, des demandes à
  adresser au Village (`domain/saga.ts`), et le service les traduit en messages
  (`application/forge-service.ts`) :
  - `ItemOrdered` et `UpgradeOrdered` produisent `realm.withdraw`, avec
    `replyTo: forge.transfer-result` ;
  - la réponse du Village (`withdrawn` ou `refused`) devient la commande
    `RecordTransferResult`, qui produit `PaymentConfirmed` (début de la fabrication) ou
    `PaymentRefused` (travail abandonné, quantités manquantes indiquées) ;
  - **compensation (bonus B5)** : `OrderCancelled` produit `realm.deposit` du coût payé.
    L'annulation n'est possible que pendant la fabrication, donc après un paiement confirmé :
    on ne compense jamais un prélèvement dont on ignore encore l'issue.
- **Atomicité locale.** Les messages sont enregistrés dans la même transaction que les
  événements qui les déclenchent (ADR 0010). Aucune transaction ne couvre les deux modules.
- **Idempotence des deux côtés.** L'identifiant d'un mouvement est construit par la Forge et
  déterministe : `forge:<playerId>:<numéro du travail>:pay|refund`. Le Village ignore un
  mouvement déjà traité. La Forge ignore toute réponse qui ne correspond pas au travail en
  attente de paiement (règle 11).
- Le gestionnaire `forge.transfer-result` (`messages.ts`) déduit la forge concernée de
  l'identifiant du mouvement (`playerIdOf`). Un identifiant étranger lève une erreur : le
  message finit abandonné, il n'est jamais appliqué à une autre forge.
- La boîte d'envoi est distribuée après chaque commande et avant chaque lecture de la forge.
  Dans le cas ordinaire, la réponse du Village est déjà enregistrée quand la requête du joueur
  répond. Une saga interrompue reprend à la requête suivante qui distribue la boîte d'envoi.
- Le Village n'est pas modifié.
- La communication avec la Taverne, le Donjon et le Classement passe par l'interface, et non
  par des messages (ADR 0012).

## Conséquences

### Positives

- Les garanties sont celles, éprouvées, de la saga du Marché : livraison au moins une fois,
  gestionnaires idempotents, cohérence différée bornée à la distribution suivante.
- Le Village reste intact, en mode local comme en mode distant. La saga franchit la frontière
  du service extrait sans modification, puisqu'elle ne passe que par la boîte d'envoi.
- Les étapes sont testées par l'API : prélèvement, refus sans prélèvement, remboursement à
  l'annulation, réponse livrée deux fois (`src/bootstrap/forge-api.test.ts`).
- Les messages sont décidés par le domaine pur, et donc testés sans base.

### Négatives

- La cohérence est différée et visible. Entre la commande et la réponse du Village, la forge
  affiche « Le Village prépare le paiement... ». Si la distribution échoue, cet état dure
  jusqu'à la prochaine requête qui distribue la boîte d'envoi.
- **Un travail peut rester bloqué.** Si le message `realm.withdraw` est abandonné après ses
  tentatives (Village indisponible, ou village supprimé entre-temps), la forge reste en
  attente de paiement : elle refuse toute nouvelle commande (`FORGE_BUSY`), et l'annulation
  n'est pas permise dans cet état. Seule une relance manuelle du message abandonné la
  débloque (dette technique à consigner).
- Le remboursement est supposé infaillible : aucune réponse n'est attendue pour
  `realm.deposit`. S'il était abandonné, le joueur ne serait pas remboursé, et rien ne le lui
  signalerait.
- Le joueur ne peut pas annuler pendant l'attente du paiement. C'est un choix de simplicité
  plutôt qu'une contrainte du jeu.
- Les ressources d'une fabrication refusée ne sont jamais réservées à l'avance : deux
  commandes successives ne peuvent pas se concurrencer (un seul travail à la fois, règle 2),
  mais une offre du Marché peut consommer le stock entre la commande et sa confirmation.

## Alternatives écartées

- **Appel direct au service du Village** par son entrée `index.ts`, dans la requête du joueur :
  le prélèvement et l'événement de la Forge seraient dans deux transactions. Un arrêt entre les
  deux ferait payer un objet jamais commandé, ou l'inverse. L'appel ne fonctionnerait pas non
  plus avec le Village extrait.
- **Lire le stock dans le langage publié du Village, puis prélever** : le stock peut changer
  entre la lecture et le prélèvement (vérifier puis agir), et seul le Village peut décider.
- **Chorégraphie** : le Village réagirait à un événement publié par la Forge. Il faudrait alors
  que le Village connaisse la Forge et lise son flux, ce qui inverserait la dépendance et
  modifierait un module existant.
- **Transaction distribuée (validation en deux phases)** : non disponible entre modules ni sur
  Neon serverless, et elle lierait la disponibilité de la Forge à celle du Village.
- **Réserver les ressources à la commande, comme l'offre du Marché** : une étape et un
  événement de plus pour un gain nul, puisqu'un seul travail est en cours à la fois.

## Réexamen

- Si des messages de la Forge apparaissent parmi les messages abandonnés de la boîte d'envoi :
  ajouter une échéance au paiement (par exemple 10 minutes, calculée à la lecture comme
  l'ADR 0010), après laquelle le travail en attente peut être annulé.
- Si la Forge doit un jour réserver des ressources sur une longue durée (plusieurs travaux en
  file), revoir la réservation à la commande.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-25 : rédaction de cet ADR à partir de la fiche de cadrage, de
l'ADR 0007 et du code du module (`domain/saga.ts`, `domain/forge.ts`, `messages.ts`,
`application/forge-service.ts`). La saga et ses tests ont également été écrits avec Claude.
Vérification par l'auteur : relecture, exécution des tests de la saga par `pnpm test`, et
commande puis annulation d'un objet sur le déploiement, avec contrôle du stock du village
avant et après.