# ADR-0005 - Une intelligence artificielle déterministe, exécutée dans le domaine, sans tâche de fond

- Statut : accepté
- Date : 2026-10-21

## Contexte

- Le Donjon a besoin de monstres dont le comportement dépend d'un niveau de difficulté, et
  de compagnons pilotés par l'ordinateur qui permettent de jouer seul.
- L'hébergement ne permet aucun processus permanent (ADR 0004) : aucune boucle de jeu ne
  peut faire agir un personnage de sa propre initiative.
- L'état d'une expédition est reconstruit à partir de ses événements, et une manche peut
  être calculée lors d'une lecture sans être enregistrée (ADR 0002 et 0004) : une décision
  de l'ordinateur doit être identique à chaque calcul.

## Décision

- Les décisions de l'intelligence artificielle sont des fonctions pures du domaine,
  appelées au moment de la résolution d'une manche (`monster-strategies.ts`,
  `companion.ts`).
- Elles ne tirent au sort qu'au moyen du générateur de la manche.
- Leurs résultats, actions des compagnons comprises, sont enregistrés dans l'événement
  `RoundResolved`.
- Le comportement des monstres est isolé derrière un port de stratégie, dont chaque niveau
  de difficulté (facile, difficile) fournit une mise en œuvre.
- Un compagnon n'agit que si au moins un joueur a choisi une action pour la manche.
- L'équilibre du jeu est mesuré par simulation (`scripts/simulate-dungeon.ts`), et protégé
  par des tests statistiques.

## Conséquences

### Positives

- Le comportement est reproductible : une graine donnée produit toujours les mêmes
  décisions, ce qui permet des tests exacts et la relecture fidèle d'une expédition.
- Aucune infrastructure supplémentaire : l'intelligence artificielle s'exécute dans la
  requête qui résout la manche, comme le reste du domaine.
- Ajouter un niveau de difficulté ne demande qu'une nouvelle stratégie ; la vérification
  des types signale toute stratégie manquante.
- Le domaine reste pur et testable sans base de données ni serveur.
- L'enregistrement des décisions rend l'historique indépendant du code : modifier une
  stratégie ne change pas les expéditions passées.
- L'équilibre est mesuré plutôt que supposé, et une régression est détectée par les tests
  statistiques.

### Négatives

- Un personnage piloté par l'ordinateur ne peut pas agir entre deux échéances, ni réagir en
  temps réel : il n'agit qu'à la résolution d'une manche.
- La qualité de l'équilibre dépend de la règle suivie par les joueurs simulés : des joueurs
  réels qui jouent autrement peuvent trouver le jeu plus facile ou plus difficile que
  mesuré (la simulation montre déjà qu'une expédition de quatre joueurs reste facile au
  niveau difficile).
- Les tests statistiques ont une marge : ils peuvent laisser passer un léger déséquilibre,
  ou demander d'être ajustés lorsque le contenu du jeu change.
- Le calcul de l'intelligence artificielle s'ajoute au temps de chaque lecture qui résout
  une manche échue ; une stratégie coûteuse ralentirait toutes les consultations.

## Alternatives écartées

- **Une boucle de jeu exécutée par un processus permanent** : impossible sur l'hébergement
  sans serveur (ADR 0004), et contraire au critère de gratuité si un serveur dédié était
  ajouté.
- **Des décisions prises par le navigateur d'un joueur** : un joueur pourrait les modifier
  ou les prévoir, et les monstres n'agiraient plus si aucun navigateur n'est ouvert.
- **Un recalcul des décisions lors de la relecture, plutôt que leur enregistrement** :
  toute modification d'une stratégie réécrirait le passé des expéditions terminées, et la
  relecture dépendrait de la version du code.

## Réexamen

Cette décision devra être réexaminée :

- si le jeu a besoin d'un personnage qui agit en temps réel, indépendamment des manches ;
- si une intelligence artificielle devient trop coûteuse en calcul pour être exécutée
  pendant une lecture ;
- si les mesures tirées du journal de production montrent que les joueurs réels s'écartent
  nettement des joueurs simulés.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques Conséquences, Alternatives
écartées et Réexamen, ainsi que du titre, du statut et de la date, à partir des éléments
imposés par la sous-partie 5.1 du TD7 et de la lecture du code (`src/modules/dungeon/domain/`).
Les rubriques Contexte et Décision reprennent l'énoncé du TD. Vérification par l'auteur :
relecture, et exécution de `pnpm exec tsx scripts/simulate-dungeon.ts` pour confirmer le
constat sur les expéditions de quatre joueurs.