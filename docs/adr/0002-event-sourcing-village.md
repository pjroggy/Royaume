# ADR-0002 - Event Sourcing comme mode de persistance du Village

- Statut : accepté
- Date : 2026-10-20

## Contexte

Le Village est un état qui n'évolue que par des actions successives du joueur : fondation,
puis améliorations de bâtiments. La production de ressources n'est jamais enregistrée :
elle est calculée à partir du temps écoulé depuis la dernière action.

La suite du projet annonce deux besoins qui portent sur ces changements plutôt que sur
l'état lui-même :

- diffuser chaque changement en temps réel aux navigateurs du joueur (TD5) ;
- construire des vues de lecture, comme un classement, à partir de l'activité des joueurs
  (TD8).

L'hébergement sur Vercel peut faire traiter au même instant deux requêtes concernant un
même village par deux instances distinctes de l'application, qui ne partagent aucune
mémoire. Deux améliorations lancées simultanément ne doivent pas dépenser deux fois les
mêmes ressources.

## Décision

- L'état d'un village n'est pas stocké : il est reconstruit en rejouant ses événements
  avec la fonction `evolve` du domaine.
- Les événements sont enregistrés dans un journal générique de la plateforme, la table
  `platform.events` (`src/platform/event-store/`), à raison d'un flux par village, nommé
  `village-<identifiant du joueur>`.
- Chaque événement porte une version dans son flux. Une contrainte d'unicité sur le couple
  (flux, version) détecte les écritures concurrentes ; la commande en conflit est alors
  rechargée et rejouée, au plus trois fois (`withOptimisticRetry`).
- Un événement porte toutes les informations nécessaires à son application, par exemple le
  coût effectivement payé pour une amélioration : rejouer un événement ne dépend jamais du
  catalogue en vigueur au moment de la relecture.

## Conséquences

### Positives

- L'historique complet de chaque village est conservé : on peut reconstruire son état à
  n'importe quelle version passée, et comprendre comment il y est arrivé.
- Les changements sont déjà disponibles sous forme de faits datés et ordonnés : le temps
  réel (TD5) et les projections (TD8) pourront les lire sans que le Village ait à les
  publier une seconde fois.
- La concurrence est traitée sans verrou : la contrainte d'unicité suffit à détecter un
  conflit, et la plupart des requêtes n'en rencontrent aucun.
- Le domaine reste pur : `decide` produit des événements, `evolve` les applique, et la
  persistance se limite à les ajouter au journal. Le même port est satisfait par un
  adaptateur en mémoire dans les tests.
- Le journal est générique : les autres modules (Donjon, Marché) pourront l'utiliser sans
  modification de la plateforme.

### Négatives

- Un événement enregistré n'est jamais modifié : toute évolution de sa structure doit
  rester compatible avec les événements déjà présents, par exemple au moyen d'un
  « upcasting » à la lecture. Une erreur dans un événement ne se corrige que par un
  événement compensatoire.
- Le coût de chargement d'un village croît avec le nombre de ses événements, puisque l'état
  est recalculé à chaque requête.
- Les requêtes qui traversent plusieurs villages (« les dix meilleurs joueurs ») ne peuvent
  pas être exprimées directement en SQL sur le journal : elles demandent des vues de
  lecture dédiées.
- Le modèle est moins familier qu'une table d'état : il faut comprendre `decide`, `evolve`,
  les versions et le nouvel essai pour intervenir sur le module.
- Sous forte contention sur un même village, les nouveaux essais peuvent s'épuiser et la
  commande échouer après trois tentatives.

## Alternatives écartées

- **Stockage de l'état dans une table propre au module** (`realm.villages`, une ligne par
  village mise à jour à chaque action) : plus simple à lire, mais l'historique est perdu,
  et le temps réel comme le classement devraient être alimentés par un mécanisme de
  publication supplémentaire, avec le risque d'oublier un changement.
- **Verrouillage pessimiste** (`SELECT ... FOR UPDATE` sur le village pendant la commande) :
  il sérialise les requêtes au prix d'une transaction ouverte pendant tout le calcul, et
  d'attentes ou d'interblocages en cas de contention, alors que les conflits sont rares.
- **Un journal propre au module Village** : il aurait fallu le réécrire pour chaque
  module ; un journal de plateforme, sans connaissance du jeu, respecte la règle 3 et sert
  tous les modules.

## Réexamen

Cette décision devra être réexaminée :

- si le nombre d'événements par village rend la reconstruction de l'état sensiblement plus
  longue qu'une requête ordinaire (de l'ordre de plusieurs milliers d'événements) : un
  instantané (snapshot) périodique deviendrait alors nécessaire ;
- si les conflits de version deviennent fréquents au point d'épuiser les nouveaux essais ;
- si un besoin de modification ou d'effacement des données enregistrées apparaît (voir
  l'ADR 0008 pour l'effacement des données personnelles).

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques à partir des éléments imposés
par la sous-partie 5.1 du TD3 et de la lecture du code (`src/platform/event-store/`,
`src/modules/realm/`). Vérification par l'auteur : relecture de chaque rubrique,
contrôle de la limite de trois essais dans `src/platform/event-store/retry.ts` et du nom
des flux dans `src/modules/realm/`.