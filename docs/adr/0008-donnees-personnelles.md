# ADR-0008 - Un stockage classique pour la Taverne, et la réécriture ciblée des champs personnels du journal pour l'effacement
 
- Statut : accepté
- Date : 2026-10-21

## Contexte

- Le besoin : des messages et une présence destinés à disparaître ; des droits d'accès, de portabilité et d'effacement qui portent sur le jeu entier.
- L'existant : des noms de joueurs copiés dans les événements du Donjon et du Marché, et un nom de village dans ceux du Village, dans des flux parfois partagés avec d'autres joueurs.
- La règle de l'ajout seul du journal (ADR 0002), et les projections qui en dépendent (ADR 0006).

## Décision

- La Taverne utilise des tables ordinaires, dont les lignes sont supprimées à l'expiration de leur durée de conservation.
- Son canal temps réel est alimenté par une source fournie par le module.
- La présence repose sur un signal périodique ; une ligne par joueur présent, supprimée à son départ ou deux minutes après son dernier signal.
- Les durées de conservation sont appliquées à la lecture, et chaque jour par la route des tâches quotidiennes.
- Chaque module déclare ses données personnelles par un contributeur : export, réécriture de ses événements, effacement de ses tables.
- L'effacement réécrit les seuls champs de nom des événements du joueur, par une fonction unique de la plateforme, et le consigne dans un registre qui ne contient aucune donnée sur le joueur.
- L'identité est effacée en dernier ; chaque étape est idempotente.

## Conséquences

### Positives

Au moins trois, par exemple : des droits exercés par le joueur lui-même, sans intervention ; un effacement qui n'altère ni les états reconstruits ni l'historique des autres joueurs ; une règle de conservation garantie même sans activité ; un module, la Taverne, plus simple que s'il avait suivi le modèle des autres.

### Négatives

Au moins trois, dont :

- une exception à la règle de l'ajout seul, que toute modification future du journal devra respecter strictement ;
- un effacement et un export dont le coût croît avec la taille du journal ;
- une obligation nouvelle pour chaque événement futur : déclarer ses champs personnels dans le contributeur de son module, faute de quoi ils échapperont à l'effacement ;
- un identifiant conservé dans le journal, dont la pseudonymisation dépend de la destruction effective de tout lien avec la personne.

## Alternatives écartées

Au moins trois, avec la raison de leur rejet : l'Event Sourcing pour la Taverne ; la suppression des flux du joueur ; l'effacement cryptographique ; les références sans copie ; un service externe de présence, comme une base clé-valeur en mémoire.

## Réexamen

Cette décision devra être réexaminée :
 
- lors de la conception d'un nouveau module, pour lequel les références sans copie
  devraient être préférées dès l'origine ;
- si le journal atteint une taille qui rend l'effacement trop long pour une requête ;
- si la doctrine sur l'anonymisation des identifiants pseudonymes évolue.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques Conséquences, Alternatives
écartées et Réexamen, et correction de l'en-tête (titre, statut), à partir des éléments
imposés par la sous-partie 5.1 du TD10 et de la lecture du code (`src/platform/privacy/`,
`src/modules/tavern/`). Les rubriques Contexte et Décision reprennent l'énoncé du TD.
Vérification par l'auteur : relecture, et contrôle des durées de trente jours et de deux
minutes dans `src/modules/tavern/domain/`.