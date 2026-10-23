# ADR-0009 - l'extraction du Village en service autonome, préparée mais non déployée. 

- Statut : accepté 
- Date : 2026-10-23

## Contexte

- La promesse de l'ADR 0001 : des frontières entre modules assez strictes pour qu'un module puisse être extrait.
- Les raisons d'extraire un module, présentées en 1.3, dont aucune ne s'applique aujourd'hui au jeu.
- L'inventaire des dépendances du Village, dont deux ne passent pas par le code : le Classement et le canal temps réel lisent ses événements dans le journal commun.

## Décision

- Le Village peut s'exécuter dans un service autonome, doté de sa propre base, de son propre journal et de sa propre boîte d'envoi.
- L'application devient alors une passerelle : elle reçoit une version distante du module Village, de même forme que la version exécutée dans le processus.
- Les messages de la saga franchissent la frontière par une boîte de réception, sans modifier les garanties de la boîte d'envoi.
- Un relais recopie le flux d'événements publié par le service dans le journal de l'application, où le Classement et le canal temps réel continuent de le lire.
- Les échanges entre les deux processus sont authentifiés par un secret partagé, qui n'est jamais versionné.
- Le service n'est pas déployé : en production, le Village s'exécute dans l'application.

## Conséquences

### Positives

Au moins trois, par exemple : des frontières démontrées, et non plus supposées ; six tests de contrat qui vérifieront ces frontières à chaque construction ; une extraction réversible sans migration de données ; une boîte de réception et une authentification entre services, réutilisables pour tout autre module ; la mesure du coût réel d'une extraction.

### Négatives

Au moins trois, dont :

- deux chemins d'exécution du Village à maintenir, l'un dans le processus, l'autre distant ;
- une copie des événements du Village dans le journal de l'application, dont la cohérence est différée ;
- des dettes à rembourser avant tout déploiement du service, consignées en 5.2 ;
- une authentification par secret partagé, qui permettrait, en cas de fuite, de se faire passer pour n'importe quel joueur auprès du service.

## Alternatives écartées

Au moins trois, avec la raison de leur rejet : déployer le service ; ne pas extraire, et laisser les frontières à l'état d'hypothèse ; la lecture à distance du flux publié par le Classement et le canal temps réel ; extraire un autre module, comme le Marché, dont la saga lie le sort à celui du Village ; un jeton signé ou le TLS mutuel pour authentifier les échanges.

## Réexamen

Les conditions dans lesquelles la décision devrait être revue. Elles reprennent les raisons d'extraire de 1.3, traduites en signes observables : par exemple, un Village dont le test de charge dépasse le budget alors que les autres modules le respectent ; l'arrivée d'une seconde équipe chargée du Village ; un besoin de déployer le Village plus souvent que le reste du jeu.

## Usage de l'IA générative

Outil utilisé, nature de sa contribution, manière dont le résultat a été vérifié.
Indiquer « Aucun » le cas échéant.