# ADR-NNNN - Titre de la décision

- Statut : proposé | accepté | remplacé par ADR-XXXX | abandonné
- Date : AAAA-MM-JJ

## Contexte

- Le besoin : des monstres dont le comportement dépend d'un niveau de difficulté, et des compagnons qui permettent de jouer seul.
- L'hébergement ne permet aucun processus permanent (ADR 0004).
- L'état d'une expédition est reconstruit à partir de ses événements, et une manche peut être calculée lors d'une lecture sans être enregistrée (ADR 0002 et 0004).

## Décision

- Les décisions de l'intelligence artificielle sont des fonctions pures du domaine, appelées au moment de la résolution d'une manche.
- Elles ne tirent au sort qu'au moyen du générateur de la manche.
- Leurs résultats, actions des compagnons comprises, sont enregistrés dans l'événement `RoundResolved`.
- Le comportement des monstres est isolé derrière un port de stratégie, dont chaque niveau de difficulté fournit une mise en œuvre.
- Un compagnon n'agit que si au moins un joueur a choisi une action pour la manche.
- L'équilibre du jeu est mesuré par simulation, et protégé par des tests statistiques.

## Conséquences

### Positives

Au moins trois, parmi celles présentées en 1.2 et 1.4.

### Négatives

Au moins trois, dont l'impossibilité pour un personnage piloté par l'ordinateur d'agir entre deux échéances, et le fait que la qualité de l'équilibre dépend de la règle suivie par les joueurs simulés.

## Alternatives écartées

Au moins deux, avec la raison de leur rejet : une boucle de jeu exécutée par un processus permanent, des décisions prises par le navigateur d'un joueur, un recalcul des décisions lors de la relecture plutôt que leur enregistrement.

## Réexamen

Les conditions dans lesquelles la décision devrait être revue : par exemple, le besoin d'un personnage qui agit en temps réel, ou une intelligence artificielle trop coûteuse en calcul pour être exécutée lors d'une lecture.

## Usage de l'IA générative

Selon votre propre usage.