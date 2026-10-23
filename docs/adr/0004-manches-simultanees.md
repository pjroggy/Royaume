# ADR-0004 - Manches simultanées, aux échéances paresseuses, pour les combats du Donjon

- Statut : accepté
- Date : 2026-10-20

## Contexte

Les combats du Donjon réunissent jusqu'à quatre joueurs humains. Ils ne doivent ni
s'attendre indéfiniment, ni être avantagés ou désavantagés par l'ordre dans lequel ils
jouent.

L'hébergement ne permet ni minuteur en mémoire, ni tâche de fond, et les tâches planifiées
de l'offre gratuite de Vercel ne s'exécutent qu'une fois par jour : rien ne peut
« réveiller » le serveur à la fin d'un compte à rebours.

L'état d'une expédition est reconstruit à partir de ses événements (ADR 0002) : tout
calcul, y compris le hasard, doit donner le même résultat à chaque relecture.

Les choix des joueurs doivent rester secrets jusqu'à la résolution de la manche.

## Décision

- Les héros choisissent leur action simultanément. La manche est résolue lorsque tous ont
  choisi, ou lorsque son échéance de trente secondes est atteinte ; un héros sans choix se
  défend.
- L'échéance est une donnée enregistrée dans les événements, et non un minuteur. Une manche
  échue est résolue à l'instant de son échéance, quel que soit le moment où ce calcul a
  lieu.
- Une lecture calcule la résolution des manches échues sans rien enregistrer (`settle`).
  Toute commande commence par enregistrer ces résolutions. Le navigateur envoie une
  commande d'échéance lorsque son compte à rebours atteint zéro.
- Le hasard est tiré dans `decide`, avec un générateur à graine dérivée de la graine de
  l'expédition et du numéro de manche (`random.ts`) ; ses résultats sont enregistrés dans
  les événements.
- Une action porte le numéro de la manche visée, et elle est refusée si cette manche est
  déjà résolue.
- Les écritures concurrentes des membres sont traitées par la concurrence optimiste du
  journal ; une commande du Donjon est rejouée jusqu'à cinq fois (nombre maximal de héros
  plus un), au lieu de trois pour le Village.

## Conséquences

### Positives

- Aucun joueur n'attend les autres plus de trente secondes, et l'ordre de jeu ne donne
  aucun avantage.
- Le fonctionnement respecte les contraintes de l'hébergement : aucune tâche de fond, aucun
  minuteur, seulement des données et des requêtes.
- Toute lecture affiche un état juste, même si personne n'a encore enregistré la résolution
  d'une manche échue.
- Le hasard est reproductible : la relecture d'une expédition donne toujours le même
  résultat, et les tests du domaine peuvent fixer la graine.
- Une action envoyée trop tard, ou deux fois, ne peut pas s'appliquer à une autre manche
  que celle visée.

### Négatives

- Lorsque plus aucun joueur ne se manifeste, le journal peut rester en retard sur ce
  qu'affichent les lectures : une expédition abandonnée n'enregistre jamais sa fin, et
  aucun événement `GameEnded` n'est produit pour elle.
- Les notifications temps réel dépendent des navigateurs : c'est la commande d'échéance
  envoyée par un navigateur ouvert qui provoque l'enregistrement et donc la notification.
- La logique est moins intuitive : une lecture peut montrer une manche que le journal ne
  contient pas encore, et une commande d'échéance peut ne rien faire si un autre joueur
  l'a précédée.
- Plusieurs joueurs qui agissent au même instant provoquent des conflits de version et des
  nouveaux essais, dont le nombre croît avec la taille de l'expédition.

## Alternatives écartées

- **Tour par tour strict** : chaque joueur attend tous les autres, l'ordre de jeu donne un
  avantage, et un joueur absent bloque l'expédition.
- **Minuteur en mémoire ou tâche planifiée** : un minuteur disparaît avec la fonction qui
  l'a créé, et les tâches planifiées de l'offre gratuite ne s'exécutent qu'une fois par
  jour, bien trop rarement pour des manches de trente secondes.
- **Une lecture qui enregistre elle-même la résolution** : une lecture deviendrait une
  écriture, exposée aux conflits de version, et toute consultation, même par un joueur
  non membre, modifierait le journal.
- **Un tirage par `Math.random` dont seul le résultat serait enregistré** : le calcul
  effectué lors d'une lecture et celui de la commande donneraient des résultats
  différents, et l'affichage changerait au moment de l'enregistrement.

## Réexamen

Cette décision devra être réexaminée :

- si le jeu doit enregistrer la fin d'une expédition abandonnée, par exemple pour le
  classement ;
- si un service de planification de tâches à la minute, compatible avec l'hébergement,
  devient disponible ;
- si la taille des expéditions augmente au point que les conflits de version deviennent
  fréquents.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques à partir des éléments imposés
par la sous-partie 5.1 du TD6 et de la lecture du code (`src/modules/dungeon/`).
Vérification par l'auteur : relecture de chaque rubrique, contrôle de `ROUND_MS` dans
`domain/content.ts` et de `MAX_ATTEMPTS` dans `application/dungeon-service.ts`.