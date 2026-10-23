# ADR-0003 - Server-Sent Events, alimentés par le journal, pour le temps réel

- Statut : accepté
- Date : 2026-10-20

## Contexte

Les joueurs doivent être informés des changements sans recharger la page : d'abord entre
les onglets d'un même joueur, pour son village, puis entre les participants d'une
expédition du Donjon (TD6) et pour les modules suivants.

Les actions des joueurs passent déjà par l'API, au moyen de requêtes HTTP authentifiées :
seule la communication du serveur vers le navigateur manque.

L'hébergement impose ses contraintes : la durée d'exécution d'une fonction Vercel est
plafonnée, plusieurs instances peuvent fonctionner en même temps sans mémoire partagée, et
l'offre gratuite ne fournit aucune infrastructure supplémentaire (courtier de messages,
service de diffusion).

Le journal d'événements existe déjà, et chaque flux y porte des versions croissantes
(ADR 0002).

## Décision

- Les changements sont diffusés par des Server-Sent Events, sur la route
  `/api/stream/<canal>` (`src/platform/realtime/stream-api.ts`).
- Un canal correspond exactement à un flux du journal. L'identifiant de chaque message est
  la version de l'événement : à la reconnexion, le navigateur envoie l'en-tête
  `Last-Event-ID` et le flux reprend sans perte ni doublon.
- Le flux relit le journal toutes les demi-secondes. Il se ferme de lui-même au bout de
  240 secondes, sous la limite de Vercel, et le navigateur s'y reconnecte automatiquement.
- L'accès est réservé aux joueurs connectés. Chaque module déclare la règle d'accès à ses
  canaux (`channel-policy.ts`) ; un canal qu'aucune règle ne couvre est refusé.
- À chaque notification, l'interface relit sa vue par l'API, plutôt que d'appliquer
  elle-même le contenu des événements (hook `useChannel`).

## Conséquences

### Positives

- La solution fonctionne dans les limites de l'exécution sans serveur : une simple réponse
  HTTP transmise progressivement, interrompue et reprise.
- Aucune infrastructure supplémentaire : le journal sert à la fois de source de vérité et
  de file de notification, et toutes les instances voient les mêmes événements.
- La reprise est exacte grâce aux versions et à `Last-Event-ID` : une coupure réseau ou la
  fin d'un flux ne fait perdre aucun changement.
- La reconnexion est assurée nativement par `EventSource`, sans code dans l'interface.
- Les règles métier restent sur le serveur : l'interface relit une vue calculée par le
  domaine et n'a pas à rejouer les événements.
- Le contrôle d'accès est fermé par défaut : l'oubli d'une règle par un module futur rend
  ses canaux inaccessibles, et non publics.

### Négatives

- Chaque flux ouvert lit le journal deux fois par seconde : la charge de la base croît
  linéairement avec le nombre de joueurs connectés, même lorsqu'il ne se passe rien.
- Un événement est reçu avec un délai pouvant atteindre une demi-seconde, plus le temps de
  la relecture de la vue.
- Chaque flux occupe une fonction Vercel pendant 240 secondes, ce qui consomme le quota
  d'exécution de l'offre gratuite.
- Chaque notification provoque une requête supplémentaire de l'interface pour relire sa
  vue.
- La communication reste à sens unique : un besoin d'échange du navigateur vers le serveur
  à très faible délai ne serait pas couvert.

## Alternatives écartées

- **WebSocket** : exigent une connexion maintenue par un serveur permanent, ce que
  l'exécution sans serveur de Vercel ne permet pas dans de bonnes conditions ; la
  communication bidirectionnelle qu'elles apportent n'est pas nécessaire ici.
- **Interrogation périodique par le navigateur** : simple, mais chaque interrogation est
  une requête complète, authentifiée, avec sa vue recalculée ; le délai et la charge sont
  moins bons que ceux d'un flux, et la reprise exacte doit être réécrite à la main.
- **Notification partagée entre instances** (`LISTEN/NOTIFY` de PostgreSQL, ou un service
  de messagerie hébergé) : `LISTEN` demande une connexion dédiée et durable, incompatible
  avec le regroupement de connexions de Neon et avec des fonctions éphémères ; un service
  externe ajouterait un compte, un coût et une dépendance hors du critère de gratuité.

## Réexamen

Cette décision devra être réexaminée :

- si le nombre de joueurs connectés simultanément rend les lectures du journal pesantes
  pour la base (à surveiller dans le tableau de bord de Neon) ;
- si un besoin de communication du navigateur vers le serveur à très faible délai
  apparaît ;
- si l'hébergeur propose une prise en charge stable des WebSocket, ou si le projet quitte
  l'exécution sans serveur.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-22 : rédaction des rubriques à partir des éléments imposés
par la sous-partie 5.1 du TD5 et de la lecture du code (`src/platform/realtime/`).
Vérification par l'auteur : relecture de chaque rubrique, contrôle des valeurs de 500 ms et
240 s dans `src/platform/realtime/stream-api.ts` et `src/bootstrap/server.ts`.