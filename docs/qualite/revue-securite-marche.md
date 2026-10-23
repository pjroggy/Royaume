# Revue de sécurité du Marché : intégrité des échanges

- Date : 2026-10-23
- Périmètre : API du module Marché, gestionnaires de messages du Village et du Marché, boîte d'envoi et sa route de distribution, canal temps réel du Marché.
- Références : OWASP Top 10 (A01 Broken Access Control, A04 Insecure Design, A08 Software and Data Integrity Failures).

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| M1 | Un joueur ne publie, n'accepte et ne retire une offre qu'en son propre nom | Lecture de `api.ts` : aucune route n'accepte d'identifiant de joueur | Dans les cinq routes de `api.ts`, le joueur est construit à partir de `c.var.userId` et `c.var.userName` ; `PublishOfferInput` ne contient que les quantités échangées. | Conforme |
| M2 | Seul le vendeur peut retirer son offre et récupérer les ressources en séquestre | Test « restitue les ressources au vendeur qui retire son offre » | Le test réussit : le retrait par un autre joueur reçoit une erreur 403, celui du vendeur restitue ses 100 bois. | Conforme |
| M3 | Un joueur ne peut pas accepter sa propre offre | Tests « refuse l'acceptation de sa propre offre... » et « restitue les ressources au vendeur... » | Les tests réussissent : `decide` refuse l'acceptation par le vendeur, et l'API répond 409. | Conforme |
| M4 | Aucun échange ne crée ni ne détruit de ressources, y compris lors d'acceptations simultanées | Test « ne conclut l'échange qu'avec un seul acheteur, lors de deux acceptations simultanées » | Les tests réussissent, ainsi que « réalise l'échange complet, sans créer ni perdre de ressource ». La concurrence optimiste du journal ne laisse qu'une acceptation passer l'état `open`. | Conforme |
| M5 | Un message remis plusieurs fois n'a d'effet qu'une fois | Test « n'a qu'un effet, et ne répond qu'une fois, lorsqu'un message est remis deux fois » ; test « ignore une réponse en double... » | Les deux tests réussissent : le Village retient chaque `transferId` traité, et le Marché ignore une réponse qui ne correspond pas à l'étape en cours. | Conforme |
| M6 | Les quantités échangées sont des entiers strictement positifs, à l'entrée de l'API comme à la réception d'un message | Publication d'une offre de -50 bois ; schéma `ResourceAmounts` | Le schéma `ResourceAmounts` (`realm/contracts.ts`) impose des entiers strictement positifs, sans clé inconnue. Il valide à la fois l'entrée de l'API (`PublishOfferInput`) et la réception d'un message (`TransferRequest`, analysé par les gestionnaires du Village). Aucun test ne porte sur une quantité négative. Vérifié par l'auteur le 2026-10-23 : la publication d'une offre de -50 bois reçoit l'erreur `INVALID_INPUT` avec le code 400, et le stock du village est inchangé. | Conforme |
| M7 | Aucun joueur ne peut provoquer un mouvement de ressources dans un village autrement que par une offre | Lecture des routes de l'API : aucune n'enregistre de message dans la boîte d'envoi | Les routes du Marché n'appellent que le service, qui n'enregistre des messages que comme conséquence d'une décision du domaine de l'offre. Aucune route du Village n'enregistre de message. La boîte de réception `/internal`, ajoutée au TD11, n'est montée que si le Village est extrait, et exige le secret de service. | Conforme |
| M8 | La route de distribution planifiée n'est accessible qu'avec le secret, absent du dépôt | Test « refuse une requête sans le secret attendu, et reste fermée sans secret configuré (401) » ; `git grep -n CRON_SECRET` | Le test réussit. `git grep -n CRON_SECRET` ne trouve que des mentions sans valeur (`.env.example`, commentaires, documentation) et le secret fictif des tests (`TEST_CRON_SECRET`). Sans secret configuré, la route est fermée. La comparaison du secret n'est pas faite à temps constant ; le risque est négligeable pour un secret aléatoire de 32 octets. | Conforme |
| M9 | Le canal du Marché ne transmet aucune donnée d'événement | Route de repli `/api/stream/market/events?after=0` | La règle du canal du Marché porte `redact: true` ; le test « retire aussi les données sur la route de repli » vérifie ce comportement pour tout canal discret. Vérifié par l'auteur le 2026-10-23 : sur la route de repli `/api/stream/market/events?after=0`, chaque événement a un champ `data` vide. | Conforme |
| M10 | Les ressources manquantes lors d'un paiement refusé ne sont connues que de l'acheteur concerné | Consultation de l'offre par le vendeur après un paiement refusé | `toView` (`domain/view.ts`) ne renseigne `missing` que si le lecteur est l'acheteur refusé ; tout autre lecteur reçoit `null`. Le test de l'API vérifie que l'acheteur reçoit `missing`, mais aucun test ne vérifie la vue du vendeur. Vérifié par l'auteur le 2026-10-23 : après un paiement refusé, l'offre consultée au nom du vendeur porte `missing: null`. | Conforme |

## Synthèse

Sur 10 exigences : 10 conformes, aucune non conforme ni en risque accepté.

Actions décidées :

- Ajouter, lors d'une prochaine évolution du Marché, un test qui vérifie que le vendeur ne voit pas les ressources manquantes (M10), et un test de publication d'une quantité négative (M6) : ces exigences ne reposent aujourd'hui que sur la lecture du code.
- La dette DT-007, ouverte par cette revue, a été remboursée au TD11 (`scripts/dead-letters.ts`).

## Vérifications manuelles

Menées le 2026-10-23, connecté dans le navigateur, depuis la console des outils de développement :

- **M6** : la réponse doit être `INVALID_INPUT`, avec le code 400, et le stock du village ne doit pas changer.

```js
await (await fetch('/api/market/offers', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ give: { wood: -50 }, want: { stone: 10 } }),
})).json()
```

- **M9** : chaque événement doit avoir un champ `data` vide.

```js
await (await fetch('/api/stream/market/events?after=0')).json()
```

- **M10** : provoquez un paiement refusé (un acheteur sans assez de ressources), puis consultez l'offre au nom du vendeur par `/api/market/offers/<identifiant>` : le champ `missing` doit valoir `null`.
