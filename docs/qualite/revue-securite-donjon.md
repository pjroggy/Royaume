# Revue de sécurité du Donjon : dissimulation d'informations et intégrité du jeu

- Date : 2026-10-23
- Périmètre : API du module Donjon, canal temps réel des expéditions, tirages au sort.
- Références : OWASP Top 10 (A01 Broken Access Control, A04 Insecure Design).

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| D1 | La vue d'une expédition ne contient ni la graine ni le contenu des salles non explorées | Test « ne transmet ni la graine ni le contenu des salles suivantes » | Le test réussit. La vue est construite par `toView` (`domain/view.ts`), qui ne recopie que les champs destinés aux joueurs. | Conforme |
| D2 | L'action choisie par un héros n'est connue que de son joueur jusqu'à la résolution de la manche | Tests « cache l'action choisie par les autres héros » et « ne révèle pas l'action d'un héros aux autres joueurs » ; outils de développement | Les deux tests réussissent. Trois protections se complètent : la vue filtrée ne montre à chacun que sa propre action (les autres héros apparaissent seulement « prêts ») ; le canal de l'expédition est discret et ne transmet aucune donnée d'événement ; la route de repli retire elle aussi les données. | Conforme |
| D3 | Le canal d'une expédition n'est accessible qu'à ses membres | Test « réserve le canal d'une expédition à ses membres (403) » | Le test réussit. La règle du canal (`index.ts`) n'autorise l'abonnement que si la vue du demandeur indique `isMember`. | Conforme |
| D4 | Le canal d'une expédition ne transmet aucune donnée d'événement, ni par le flux, ni par la route de repli | Tests du bloc « Canal discret » et « signale l'action d'un héros sans la révéler » | Les tests réussissent. La règle du canal porte `redact: true` ; la fonction `present` de `stream-api.ts` remplace alors `data` par un objet vide, sur le flux comme sur la route de repli. | Conforme |
| D5 | Un joueur ne peut agir qu'en son propre nom | Lecture de `api.ts` : aucune route n'accepte d'identifiant de joueur | Dans chacune des routes de `api.ts`, `playerId` est tiré de `c.var.userId`, et le nom de `c.var.userName` ; les corps validés (`CreateGameInput`, `SubmitActionInput`) ne contiennent aucun identifiant de joueur. | Conforme |
| D6 | Seul l'hôte lance l'expédition, et seul le héros dont c'est le tour ouvre une porte | Tests « ne laisse que l'hôte lancer l'expédition » et « fait ouvrir les portes à tour de rôle » | Les tests du domaine et de l'API (403 `NOT_HOST`) réussissent ; `decide` refuse la porte avec `NOT_YOUR_TURN`. | Conforme |
| D7 | Un joueur ne peut ni choisir ni prévoir le résultat d'un tirage au sort | Lecture de `dungeon-service.ts` : graine tirée par le serveur ; exigence D1 | La graine est tirée par `crypto.getRandomValues` dans `dungeon-service.ts` ; aucune route ne permet de la fournir. Elle n'est jamais transmise au navigateur (D1, D4, D13). | Conforme |
| D8 | L'échéance d'une manche est appréciée par l'horloge du serveur | Commande d'échéance envoyée avant l'échéance | La route `POST /games/:id/deadline` n'a pas de corps : l'instant est fourni par l'horloge du service, et `settle` ne résout que les manches dont l'échéance enregistrée est passée. Vérifié par l'auteur le 2026-10-23 : une commande d'échéance envoyée avant la fin du compte à rebours renvoie la vue avec un numéro de manche inchangé ; le serveur, qui ne constate aucune échéance, n'enregistre rien. | Conforme |
| D9 | Une action destinée à une manche déjà résolue est refusée | Test « refuse un choix pour une manche déjà résolue » | Le test réussit : `decide` répond `ROUND_OVER` lorsque le numéro de manche de l'action n'est pas celui de la manche en cours. | Conforme |
| D10 | Connaître l'adresse d'une expédition ne permet pas d'y agir sans en être membre | Action envoyée par un joueur qui n'est pas membre | `decide` refuse les commandes d'un non-membre. Vérifié par l'auteur le 2026-10-23 : une action envoyée par un joueur non membre reçoit l'erreur `NOT_A_MEMBER`, avec le code 403. Ce qui reste possible : un joueur connecté qui connaît l'identifiant d'une expédition peut la consulter (`GET /games/:id`). La vue ne contient que des informations publiques, et ce choix permet de rejoindre une expédition à partir de son adresse. Voir D14 : l'identifiant n'est pas secret. Ce risque est accepté. | Risque accepté |
| D11 | Aucun joueur ne peut agir au nom d'un compagnon ni écouter le canal en son nom | Test « présente le compagnon comme prêt, et ne le compte pas parmi les membres » ; fonction `isMember` de `rules.ts` | Le test réussit. `isMember` ne retient que les héros non compagnons ; l'identifiant d'un compagnon (`companion-1`…) ne correspond à aucun compte. | Conforme |
| D12 | L'intelligence artificielle ne transmet aux joueurs aucune information qu'ils n'auraient pas autrement | Lecture de `companion.ts` et `monster-strategies.ts` ; vue filtrée inchangée | Les décisions sont des fonctions pures, appelées uniquement à la résolution d'une manche ; leurs résultats ne figurent que dans `RoundResolved`, donc après la résolution, comme ceux des joueurs. `toView` n'expose aucune intention future des monstres ou des compagnons. | Conforme |
| D13 | Le canal du classement ne transmet aucune donnée d'événement, en particulier la graine d'une expédition | Test « annonce sur son canal les événements du classement, sans leurs données » | Le test réussit. La règle du canal du classement porte `redact: true`. | Conforme |
| D14 | Les informations transmises par le canal du classement sont déjà accessibles à tout joueur connecté | Lecture de la fonction `present` de `stream-api.ts` ; réponse de l'API du classement | Le canal transmet encore la position, le type, la version et le nom du flux. Deux écarts apparaissent. (1) Les flux `village-<identifiant>` révèlent l'identifiant de tout joueur qui améliore un bâtiment, alors que l'API du classement n'expose que les 20 premiers. (2) Les flux `dungeon-<identifiant>` révèlent l'identifiant de toutes les expéditions, y compris celles déjà lancées, qui ne figurent pas dans la liste des expéditions ouvertes. Ces identifiants ne permettent ni d'agir (D10) ni d'écouter un canal (D3), mais ils permettent de consulter la vue publique de n'importe quelle expédition. | Risque accepté |

## Synthèse

Sur 14 exigences : 12 conformes, 2 en risque accepté (D10, D14), aucune non conforme.

Actions décidées :

- D10 : la consultation d'une expédition par un non-membre est conservée, car elle permet de rejoindre une expédition à partir de son adresse, et la vue ne contient que des informations publiques.
- D14 : le risque est accepté, car les identifiants révélés sont pseudonymes et ne donnent accès qu'à des vues publiques. Il est consigné dans le registre de la dette (DT-011) : réserver la consultation d'une expédition lancée à ses membres, ou retirer le nom du flux des événements du canal global.

## Vérifications manuelles

Menées le 2026-10-23. Lancez le serveur de développement et jouez une expédition jusqu'à un combat, avec deux comptes.

- **D8** : dans la console d'un membre, avant la fin du compte à rebours :

```js
await fetch(`/api/dungeon/games/${location.pathname.split('/').pop()}/deadline`, { method: 'POST' })
  .then((res) => res.json())
```

  Le numéro de manche de la vue renvoyée doit être inchangé.

- **D10** : ouvrez la même adresse avec un troisième compte, non membre, et envoyez une action :

```js
await fetch(`/api/dungeon/games/${location.pathname.split('/').pop()}/action`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ round: 1, action: { type: 'defend' } }),
}).then((res) => res.json())
```

  La réponse doit être l'erreur `NOT_A_MEMBER`, avec le code 403.
