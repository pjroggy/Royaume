# ADR-NNNN - Titre de la décision

Le titre énonce la décision : les opérations qui concernent plusieurs modules sont des sagas orchestrées, dont les messages transitent par une boîte d'envoi transactionnelle. Le statut est « accepté ».

## Contexte

- Le besoin : un échange du Marché modifie les données du Marché et celles de deux villages, et ne doit ni créer ni perdre de ressources.
- La règle d'encapsulation des modules (TD2), et la perspective de l'extraction d'un module dans un service doté de sa propre base (TD11).
- L'hébergement ne permet aucun processus permanent (ADR 0004).

## Décision

- Une transaction ne modifie jamais les données que d'un seul module.
- Une opération qui concerne plusieurs modules est une saga ; ses étapes compensables, pivot et reprises jusqu'au succès sont identifiées.
- La saga est orchestrée par le module qui porte l'opération ; les participants ne connaissent pas la saga, et répondent à l'adresse de retour indiquée dans chaque demande.
- Les messages sont enregistrés dans la boîte d'envoi de la plateforme, dans la même transaction que les événements qui les déclenchent.
- La distribution est garantie au moins une fois : bail, nouvel essai avec recul exponentiel, abandon après dix tentatives.
- Chaque gestionnaire est idempotent, grâce à une clé d'idempotence choisie par le demandeur.
- La distribution a lieu après chaque commande et chaque consultation du Marché, et chaque jour par une tâche planifiée protégée par un secret.

## Conséquences

### Positives

Au moins trois, par exemple : aucun module n'écrit dans les données d'un autre ; une panne à n'importe quel moment ne perd ni ne duplique aucune ressource ; le Village peut servir d'autres demandeurs sans modification ; la boîte d'envoi sert aussi de minuterie ; le déroulement de la saga se lit en un seul endroit.

### Négatives

Au moins trois, dont :

- des états intermédiaires visibles des joueurs, comme une offre en règlement ;
- une latence qui dépend de l'activité : une saga interrompue ne reprend qu'à la consultation suivante du Marché, ou le lendemain ;
- l'obligation d'écrire des gestionnaires idempotents, et de tester leurs doublons ;
- des messages abandonnés qu'aucun outil ne permet encore d'examiner (dette DT-007) ;
- une table de la boîte d'envoi qui grandit sans limite, les messages traités étant conservés.

## Alternatives écartées

Au moins trois, avec la raison de leur rejet : une transaction unique englobant les données des deux modules ; une transaction distribuée par validation en deux phases ; un appel direct du Village par le Marché, sans boîte d'envoi ; une saga chorégraphiée ; le journal d'événements utilisé comme boîte d'envoi.

## Réexamen

Les conditions dans lesquelles la décision devrait être revue : par exemple, l'extraction d'un module dans un service distinct, qui demanderait une boîte d'envoi par base et un transport entre services ; un volume de messages qui justifierait un courtier de messages dédié ; un besoin de latence que la distribution déclenchée par les requêtes ne satisfait plus.

## Usage de l'IA générative

Outil utilisé, nature de sa contribution, manière dont le résultat a été vérifié.
Indiquer « Aucun » le cas échéant.