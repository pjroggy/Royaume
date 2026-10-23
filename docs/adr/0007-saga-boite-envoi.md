# ADR-0007 - Les opérations entre modules sont des sagas orchestrées, dont les messages transitent par une boîte d'envoi transactionnelle

- Statut : accepté
- Date : 2026-10-21

## Contexte

- Un échange du Marché modifie les données du Marché et celles de deux villages : les
  ressources du vendeur et de l'acheteur. Il ne doit ni créer ni perdre de ressources,
  même si l'une des étapes échoue ou si le serveur s'arrête en cours de route.
- Les modules n'écrivent jamais dans les données d'un autre (règle d'encapsulation, TD2),
  et l'extraction d'un module dans un service doté de sa propre base est envisagée
  (TD11) : une transaction englobant deux modules ne serait alors plus possible.
- L'hébergement ne permet aucun processus permanent (ADR 0004) : aucun programme ne peut
  distribuer les messages en continu.

## Décision

- Une transaction ne modifie jamais les données que d'un seul module.
- Une opération qui concerne plusieurs modules est une saga. Ses étapes compensables, son
  étape pivot et ses étapes reprises jusqu'au succès sont identifiées
  (`src/modules/market/domain/saga.ts`).
- La saga est orchestrée par le module qui porte l'opération, ici le Marché. Les
  participants, comme le Village, ne connaissent pas la saga : ils répondent à l'adresse
  de retour indiquée dans chaque demande.
- Les messages sont enregistrés dans la boîte d'envoi de la plateforme
  (`platform.outbox`), dans la même transaction que les événements qui les déclenchent.
- La distribution est garantie au moins une fois : bail de trente secondes, nouvel essai
  avec recul exponentiel, abandon après dix tentatives.
- Chaque gestionnaire est idempotent, grâce à une clé d'idempotence choisie par le
  demandeur.
- La distribution a lieu après chaque commande et chaque consultation du Marché, et chaque
  jour par une tâche planifiée protégée par un secret (`CRON_SECRET`).

## Conséquences

### Positives

- Aucun module n'écrit dans les données d'un autre : les frontières restent intactes, et
  l'extraction d'un module reste possible.
- Une panne à n'importe quel moment ne perd ni ne duplique aucune ressource : un message
  est enregistré avec l'événement qui le cause, ou pas du tout, et un message remis deux
  fois n'a qu'un effet.
- Le Village peut servir d'autres demandeurs sans modification : il réagit à des demandes
  de mouvement de ressources, sans rien savoir du Marché.
- La boîte d'envoi sert aussi de minuterie : un message dont la date de disponibilité est
  future permet de faire échoir une offre sans tâche de fond.
- Le déroulement complet de la saga se lit en un seul endroit, le domaine du Marché.

### Négatives

- Des états intermédiaires sont visibles des joueurs, comme une offre « en règlement »
  dont les ressources sont en séquestre.
- La latence dépend de l'activité : une saga interrompue ne reprend qu'à la consultation
  suivante du Marché, ou le lendemain par la tâche planifiée.
- Tous les gestionnaires doivent être idempotents, et leurs doublons doivent être testés.
- Les messages abandonnés ne peuvent encore être ni examinés ni relancés par un outil
  (dette DT-007).
- La table de la boîte d'envoi grandit sans limite, les messages traités étant conservés.

## Alternatives écartées

- **Une transaction unique englobant les données des deux modules** : le Marché devrait
  écrire dans les tables du Village, ce qui viole l'encapsulation, et la solution
  deviendrait impossible dès l'extraction d'un module.
- **Une transaction distribuée par validation en deux phases** : elle demande un
  coordinateur et des participants qui la prennent en charge, bloque des ressources
  pendant la coordination, et n'est pas disponible sur l'hébergement retenu.
- **Un appel direct du Village par le Marché, sans boîte d'envoi** : si le serveur s'arrête
  entre l'enregistrement de l'offre et l'appel, ou si l'appel échoue, les deux modules
  divergent sans que rien ne le rattrape.
- **Une saga chorégraphiée**, où chaque module réagit aux événements des autres : aucun
  module ne porte le déroulement complet, qui se disperse entre les participants, et le
  Village devrait connaître les événements du Marché.
- **Le journal d'événements utilisé comme boîte d'envoi** : le journal ne connaît ni
  destinataire, ni bail, ni nombre de tentatives, et ces informations techniques n'ont
  pas leur place parmi les faits métier.

## Réexamen

Cette décision devra être réexaminée :

- lors de l'extraction d'un module dans un service distinct, qui demandera une boîte
  d'envoi par base et un transport entre services ;
- si le volume de messages justifie un courtier de messages dédié ;
- si un besoin de latence n'est plus satisfait par une distribution déclenchée par les
  requêtes.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques Conséquences, Alternatives
écartées et Réexamen, ainsi que de l'en-tête (titre, statut, date), à partir des éléments
imposés par la sous-partie 5.1 du TD9 et de la lecture du code (`src/platform/outbox/`,
`src/modules/market/`). Les rubriques Contexte et Décision reprennent l'énoncé du TD.
Vérification par l'auteur : relecture, et contrôle des valeurs de dix tentatives et de
trente secondes de bail dans `src/platform/outbox/outbox.ts`.