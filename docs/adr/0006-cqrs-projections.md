# ADR-NNNN - Titre de la décision

- Statut : proposé | accepté | remplacé par ADR-XXXX | abandonné
- Date : AAAA-MM-JJ

## Contexte

- Le besoin : des lectures qui traversent les flux, le classement et la liste des expéditions ouvertes, dont le calcul par rejeu croît avec l'historique du jeu (dette DT-005).
- L'hébergement ne permet aucun processus permanent (ADR 0004).
- Le journal attribue à chaque événement une position globale, croissante mais non continue (ADR 0002).

## Décision

- Les lectures transversales s'appuient sur des modèles de lecture, placés dans le schéma PostgreSQL de leur module ; les décisions s'appuient toujours sur le modèle d'écriture.
- Chaque modèle de lecture est tenu à jour par une projection, dont le point de reprise est enregistré dans la table `platform.projections`.
- Une projection est rattrapée au moment de sa consultation, dans une seule transaction, le point de reprise étant verrouillé.
- Le rattrapage s'arrête devant une position manquante tant que l'événement qui la suit a moins de cinq secondes.
- Chaque projection porte une version : une version plus élevée que celle des tables provoque leur reconstruction, une version moins élevée interdit toute écriture.
- Le classement est annoncé aux navigateurs par un canal global et discret ; l'interface relit le classement jusqu'à ce que la projection ait atteint la position annoncée.

## Conséquences

### Positives

Au moins trois, par exemple : un coût de consultation indépendant de l'historique ; des modules qui écrivent sans rien savoir des projections qui les lisent ; de nouvelles informations calculées pour le passé, sans migration de données ; aucune tâche de fond ni opération manuelle après un déploiement.

### Négatives

Au moins trois, dont :

- la cohérence à terme : un modèle de lecture peut avoir quelques secondes de retard sur le journal ;
- la reconstruction a lieu pendant une consultation, dont la durée est limitée sur Vercel : elle deviendra impossible au-delà d'une certaine taille du journal ;
- après un retour à une version précédente de l'application, une projection dont la version a été augmentée cesse d'avancer jusqu'au déploiement suivant ;
- le Classement dépend du langage publié des autres modules : un événement modifié ou ajouté sans réexamen de ses lecteurs passe inaperçu, comme l'a montré la liste des expéditions ouvertes.

## Alternatives écartées

Au moins trois, avec la raison de leur rejet : la mise à jour des modèles de lecture dans la commande, par le module qui écrit ; une tâche planifiée ; un processus de fond abonné au journal ; une vue matérialisée de PostgreSQL, entièrement recalculée à chaque rafraîchissement ; le maintien du calcul par rejeu.

## Réexamen

Les conditions dans lesquelles la décision devrait être revue : par exemple, une reconstruction qui approche la durée maximale d'une fonction, un nombre de consultations simultanées tel que le verrou du point de reprise devient un goulet d'étranglement, ou un besoin de lecture strictement à jour.

## Usage de l'IA générative

Outil utilisé, nature de sa contribution, manière dont le résultat a été vérifié.
Indiquer « Aucun » le cas échéant.