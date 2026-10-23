# ADR-0008 - Un stockage classique pour la Taverne, et la réécriture ciblée des champs personnels du journal pour l'effacement

- Statut : accepté
- Date : 2026-10-21

## Contexte

- La Taverne produit des messages et une présence destinés à disparaître. Les droits
  d'accès, de portabilité et d'effacement du RGPD portent, eux, sur le jeu entier.
- Des noms de joueurs sont copiés dans les événements du Donjon et du Marché, et un nom de
  village dans ceux du Village, dans des flux parfois partagés avec d'autres joueurs (une
  expédition, une offre).
- Le journal suit la règle de l'ajout seul (ADR 0002), et les projections en dépendent
  (ADR 0006) : modifier ou supprimer des événements peut fausser les états reconstruits et
  les modèles de lecture.

## Décision

- La Taverne utilise des tables ordinaires (`tavern.messages`, `tavern.presence`), dont les
  lignes sont supprimées à l'expiration de leur durée de conservation.
- Son canal temps réel est alimenté par une source fournie par le module, et non par le
  journal.
- La présence repose sur un signal périodique ; il existe une ligne par joueur présent,
  supprimée à son départ ou deux minutes après son dernier signal.
- Les durées de conservation sont appliquées à la lecture, et chaque jour par la route des
  tâches quotidiennes (`/api/cron/daily`).
- Chaque module déclare ses données personnelles par un contributeur (`personal-data.ts`) :
  export, réécriture de ses événements, effacement de ses tables.
- L'effacement réécrit les seuls champs de nom des événements du joueur, par une fonction
  unique de la plateforme (`src/platform/privacy/`), et le consigne dans un registre
  (`platform.erasures`) qui ne contient aucune donnée sur le joueur.
- L'identité est effacée en dernier ; chaque étape est idempotente, si bien qu'un
  effacement interrompu peut être relancé.

## Conséquences

### Positives

- Les droits sont exercés par le joueur lui-même, depuis la page « Mes données », sans
  intervention d'un administrateur.
- L'effacement n'altère ni les états reconstruits ni l'historique des autres joueurs : seuls
  les champs de nom changent, les ressources, résultats et positions restent identiques.
- La durée de conservation des messages est garantie même sans aucune visite de la
  Taverne, grâce à la tâche quotidienne.
- La Taverne est plus simple que si elle avait suivi le modèle des autres modules : un
  message se supprime par une simple requête.
- Les obligations RGPD sont réparties par module, au plus près des données, sans que la
  plateforme connaisse le jeu.

### Négatives

- Cette décision introduit une exception à la règle de l'ajout seul. Elle est strictement
  limitée aux champs personnels, et toute modification future du journal devra la
  respecter, sans servir à en justifier d'autres.
- L'effacement et l'export parcourent le journal : leur coût croît avec sa taille.
- Chaque événement futur crée une obligation : déclarer ses champs personnels dans le
  contributeur de son module, faute de quoi ils échapperont à l'effacement.
- L'identifiant du joueur reste dans le journal. Sa pseudonymisation n'est effective que si
  tout lien avec la personne est détruit, y compris dans les journaux de l'hébergeur et la
  boîte d'envoi.
- Les modèles de lecture qui copient un nom doivent eux aussi être mis à jour par
  l'effacement.

## Alternatives écartées

- **L'Event Sourcing pour la Taverne** : il n'apporte rien à des données destinées à
  disparaître, et chaque expiration demanderait une réécriture du journal.
- **La suppression des flux du joueur** : les flux partagés (expéditions, offres)
  contiennent l'histoire d'autres joueurs, qui serait détruite, et les projections
  deviendraient incohérentes.
- **L'effacement cryptographique** (chiffrer les champs personnels avec une clé par joueur,
  puis détruire la clé) : il faudrait chiffrer tous les événements existants, gérer des
  clés, et les projections devraient déchiffrer à chaque lecture.
- **Les références sans copie** (stocker l'identifiant seul et lire le nom au moment de
  l'affichage) : c'est la meilleure solution pour l'avenir, mais elle ne traite pas les
  événements déjà enregistrés et demanderait de modifier tous les modules.
- **Un service externe de présence**, comme une base clé-valeur en mémoire : un compte, une
  dépendance et un coût supplémentaires pour une fonctionnalité qu'une table suffit à
  porter.

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