# ADR-0006 - Séparer les modèles de lecture du modèle d'écriture, tenus à jour par des projections rattrapées à la lecture

- Statut : accepté
- Date : 2026-10-21

## Contexte

- Certaines lectures traversent plusieurs flux : le classement des joueurs et la liste des
  expéditions ouvertes. Calculées par rejeu du journal, leur coût croît avec l'historique
  complet du jeu, et non avec ce qu'elles affichent (dette DT-005).
- L'hébergement ne permet aucun processus permanent (ADR 0004) : aucun programme ne peut
  rester abonné au journal pour tenir des tables à jour.
- Le journal attribue à chaque événement une position globale, croissante mais non
  continue (ADR 0002) : une transaction encore en cours peut laisser un « trou » qui sera
  comblé un instant plus tard.

## Décision

- Les lectures transversales s'appuient sur des modèles de lecture, placés dans le schéma
  PostgreSQL de leur module ; les décisions s'appuient toujours sur le modèle d'écriture,
  le journal.
- Chaque modèle de lecture est tenu à jour par une projection (`src/platform/projection/`),
  dont le point de reprise est enregistré dans la table `platform.projections`.
- Une projection est rattrapée au moment de sa consultation, dans une seule transaction, le
  point de reprise étant verrouillé.
- Le rattrapage s'arrête devant une position manquante tant que l'événement qui la suit a
  moins de cinq secondes.
- Chaque projection porte une version : une version plus élevée que celle des tables
  provoque leur reconstruction, une version moins élevée interdit toute écriture.
- Le classement est annoncé aux navigateurs par un canal global et discret ; l'interface
  relit le classement jusqu'à ce que la projection ait atteint la position annoncée.

## Conséquences

### Positives

- Le coût d'une consultation ne dépend plus de l'historique du jeu, mais des seuls
  événements arrivés depuis la consultation précédente.
- Les modules qui écrivent ne savent rien des projections qui les lisent : le Classement
  ne demande aucune modification du Village ni du Donjon.
- Une nouvelle information, comme le meilleur butin, est calculée pour tout le passé par
  une simple augmentation de version, sans migration de données.
- Aucune tâche de fond ni opération manuelle n'est nécessaire après un déploiement : la
  première consultation reconstruit la projection si besoin.
- Le verrou du point de reprise et l'attente devant les positions manquantes garantissent
  qu'aucun événement n'est appliqué deux fois, ni oublié.

### Négatives

- La cohérence n'est qu'à terme : un modèle de lecture peut avoir quelques secondes de
  retard sur le journal.
- La reconstruction a lieu pendant une consultation, dont la durée est limitée sur Vercel :
  elle deviendra impossible au-delà d'une certaine taille du journal.
- Après un retour à une version précédente de l'application, une projection dont la
  version a été augmentée cesse d'avancer jusqu'au déploiement suivant.
- Le Classement dépend du langage publié des autres modules : un événement modifié ou
  ajouté sans réexamen de ses lecteurs passe inaperçu, comme l'a montré la liste des
  expéditions ouvertes, qui ne comptait pas les compagnons.
- La première consultation après une période d'activité paie le rattrapage de tous les
  événements accumulés, et les consultations simultanées attendent le verrou.

## Alternatives écartées

- **Mise à jour des modèles de lecture dans la commande, par le module qui écrit** : le
  Village et le Donjon devraient connaître le Classement, ce qui inverse les dépendances
  entre modules, et une erreur dans la vue de lecture ferait échouer l'action du joueur.
- **Une tâche planifiée** : les tâches de l'offre gratuite ne s'exécutent qu'une fois par
  jour ; le classement serait en retard d'une journée.
- **Un processus de fond abonné au journal** : impossible sans serveur permanent
  (ADR 0004).
- **Une vue matérialisée de PostgreSQL** : chaque rafraîchissement recalcule entièrement la
  vue à partir de tout le journal, ce qui ne résout pas le coût croissant, et la logique
  serait écrite en SQL hors du module.
- **Le maintien du calcul par rejeu** : c'est précisément la dette DT-005, dont le coût
  croît sans limite.

## Réexamen

Cette décision devra être réexaminée :

- si la reconstruction d'une projection approche la durée maximale d'une fonction : elle
  devrait alors être exécutée par un script hors consultation, avant la mise en service ;
- si le nombre de consultations simultanées fait du verrou du point de reprise un goulet
  d'étranglement ;
- si un besoin de lecture strictement à jour apparaît.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques Conséquences, Alternatives
écartées et Réexamen, ainsi que du titre, du statut et de la date, à partir des éléments
imposés par la sous-partie 5.1 du TD8 et de la lecture du code (`src/platform/projection/`).
Les rubriques Contexte et Décision reprennent l'énoncé du TD. Vérification par l'auteur :
relecture, et contrôle du délai de cinq secondes (`gapGraceMs`) dans
`src/platform/projection/projection.ts`.