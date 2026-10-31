# Revue de sécurité de la Forge : paiement, inventaire et chat public

- Date : 2026-10-25
- Périmètre : API du module Forge (`src/modules/forge/api.ts`), gestionnaire du message
  `forge.transfer-result` (`messages.ts`), saga de paiement avec le Village, canal temps réel
  `forge-<joueur>`, lecture publique des chats (`GET /api/forge/cats`), interface
  (`ui.tsx`), données personnelles (`personal-data.ts`) et dépendances ajoutées.
- Références : OWASP Top 10 (A01 Broken Access Control, A03 Injection, A04 Insecure Design,
  A06 Vulnerable and Outdated Components, A08 Software and Data Integrity Failures).

| N° | Exigence | Vérification | Constat | Statut |
| --- | --- | --- | --- | --- |
| F1 | Toutes les routes de la Forge sont réservées aux joueurs connectés | Tests « refuse une requête anonyme (401) » et « refuse une lecture sans identifiant, ou de plus de vingt chats (400) » (dernier cas : 401 sans session) ; lecture de `src/bootstrap/create-api.ts` | Les tests réussissent. `create-api.ts` applique `requireUser` à `/forge` et à `/forge/*` avant le montage de l'API : aucune route du module n'échappe au contrôle. | Conforme |
| F2 | Un joueur n'agit que sur sa propre forge | Lecture de `api.ts` ; test « n'agit que sur la forge du joueur connecté » | Les onze routes construisent le joueur à partir de `c.var.userId`. Aucun schéma d'entrée ne contient d'identifiant de joueur. Le test réussit : Bob ne voit pas l'inventaire d'Alice, et reçoit une erreur 404 s'il tente d'équiper ou de graver l'objet `item-1` d'Alice. | Conforme |
| F3 | Le prix d'une fabrication ou d'une amélioration est fixé par le serveur, jamais par le joueur | Lecture de `OrderItemInput` (`contracts.ts`) ; test « prélève le coût dans le village et commence la fabrication » | La commande ne transmet que l'identifiant d'une recette. Le coût est lu dans le catalogue (`domain/catalog.ts`) par `decide`, et enregistré dans `ItemOrdered`. Une recette inconnue reçoit `UNKNOWN_RECIPE` (404). Le test vérifie le prélèvement exact de 60 poisson et 40 lait. | Conforme |
| F4 | Les entrées sont validées et bornées avant d'atteindre le domaine | Tests « refuse une entrée invalide (400) et une recette inconnue (404) », « grave un objet, et refuse une gravure trop longue (400) », « enregistre l'allure choisie, et refuse une couleur qui n'est pas proposée (400) » | Les tests réussissent. Chaque corps est validé par un schéma Zod : recette et identifiant d'objet de 1 à 40 caractères, emplacement et allure limités aux valeurs du jeu, gravure bornée à 80 caractères avant la règle 8 (1 à 20 caractères après retrait des espaces). | Conforme |
| F5 | Un message remis plusieurs fois ne paie ni ne rembourse deux fois | Test « ignore une réponse du Village livrée deux fois : le coût n'est prélevé qu'une fois » ; test du domaine sur la règle 11 | Le test remet tous les messages déjà traités : le stock reste à 40 poisson et 10 lait. Le Village ignore un `transferId` déjà traité. La Forge ignore toute réponse qui ne correspond pas au travail en attente de paiement. | Conforme |
| F6 | Aucun remboursement n'est possible sans paiement confirmé | Test du domaine sur la règle 6 ; lecture de `decide` (`CancelOrder`) | L'annulation n'est acceptée que pendant la fabrication, donc après `PaymentConfirmed`, et avant l'échéance (`NOT_CANCELLABLE` sinon). Le montant remboursé est le coût enregistré à la commande, et non une valeur reçue. Un travail ne peut être annulé qu'une fois : l'annulation le retire. | Conforme |
| F7 | Une réponse du Village ne peut s'appliquer qu'à la forge qui a demandé le mouvement | Lecture de `messages.ts` et de `playerIdOf` (`domain/forge.ts`) | Le gestionnaire valide le message par un schéma Zod. Il déduit la forge de l'identifiant du mouvement, construit par la Forge elle-même, et lève une erreur pour un identifiant étranger, qui finit abandonné. Aucune route ne permet à un joueur d'enregistrer un message dans la boîte d'envoi. Aucun test ne porte sur un identifiant étranger. | Conforme |
| F8 | La fin d'une fabrication ne peut pas être avancée par le joueur | Test « refuse le retrait avant la fin de la fabrication, et l'accepte ensuite » | Le test réussit (409 `NOT_READY` avant l'échéance). L'échéance `readyAt` est calculée par le serveur, avec son horloge, à la confirmation du paiement. Aucune entrée du joueur ne la contient. | Conforme |
| F9 | Le canal temps réel d'une forge n'est accessible qu'à son propriétaire | Tests « autorise un joueur à écouter le canal de sa forge… » et « refuse l'écoute de la forge d'un autre joueur (403) » | Les tests réussissent. Le canal n'est pas discret : il transmet les données complètes des événements, gravures comprises. C'est sans risque tant que la règle d'accès le réserve au propriétaire. | Conforme |
| F10 | Les gravures ne sont jamais montrées aux autres joueurs | Test « présente l'allure et l'équipement des joueurs demandés, sans leurs gravures » | Le test grave « Secret » sur l'objet équipé d'Alice, puis lit son chat au nom de Bob : la réponse ne contient pas ce texte. Le type `PublicCat` (`domain/view.ts`) ne contient aucun champ de gravure : un oubli de filtre est impossible. | Conforme |
| F11 | Une gravure ne peut pas injecter de code dans la page | Gravure de `<img src=x onerror=alert(1)>` ; `git grep -n dangerouslySetInnerHTML -- src app` | React affiche la gravure comme du texte, échappé. La recherche ne trouve aucun usage de `dangerouslySetInnerHTML`. La gravure est limitée à 20 caractères. Vérification manuelle à mener par l'auteur (voir plus bas). | Conforme |
| F12 | La lecture publique des chats ne permet pas de surcharger le service | Test « refuse une lecture sans identifiant, ou de plus de vingt chats (400) » ; lecture de `service.cats` | Une requête est limitée à 20 identifiants distincts de 64 caractères au plus. Mais chaque identifiant provoque le rejeu complet d'un flux, sans instantané (DT-017), et aucune limitation du nombre de requêtes ne protège la route. Un joueur connecté peut aussi lire l'allure et l'équipement de n'importe quel identifiant, ce qui est voulu, puisque ces informations sont publiques dans le jeu. | Risque accepté |
| F13 | Une saga interrompue ne bloque pas durablement la forge du joueur, et ne lui fait rien perdre | Test « libère la forge après le délai, puis rembourse un prélèvement confirmé plus tard » ; rubrique « Règle 13 - paiement sans réponse » | Constat initial : un prélèvement abandonné bloquait la forge (DT-015). Après correction (ADR 0014), un travail sans réponse du Village peut être abandonné au bout de dix minutes. Si le prélèvement est confirmé ensuite, la Forge le rembourse une seule fois. Le test simule une panne du service Village, l'abandon, puis le retour du service : le village est prélevé puis remboursé, et la forge est libre. | Conforme |
| F14 | Les données personnelles de la Forge sont exportées, puis effacées avec le compte | Test « exporte la forge du joueur, et efface ses gravures avec son compte » ; fonction d'aptitude « déclare les données personnelles de chaque module qui conserve des données » | Le test réussit : l'export contient la gravure, et après la suppression du compte, l'événement `ItemEngraved` contient « Gravure effacée ». L'allure du chat est exportée. Elle n'est pas effacée, car elle ne contient que des choix du jeu, sans texte libre. | Conforme |
| F15 | Les dépendances ajoutées n'introduisent pas de vulnérabilité connue dans le code de production | `pnpm audit` ; `pnpm why esbuild uuid` | `react-icons` 5.5.0 n'est concerné par aucune alerte. `pnpm audit` signale deux vulnérabilités modérées antérieures à la Forge : `esbuild` ≤ 0.24.2 (par `drizzle-kit`) et `uuid` < 11.1.1 (par `autocannon`). Ce sont deux dépendances de développement, absentes du code déployé. | Risque accepté |

## Synthèse

Sur 15 exigences : 13 conformes, 2 en risque accepté (F12, F15). F13, non conforme à la
première revue, a été corrigée le 2026-10-25.

Actions décidées :

- **F13** : dette DT-015 consignée, puis remboursée le 2026-10-25 (règle 13, ADR 0014).
- **F12** : risque accepté pour la taille actuelle du jeu. À réexaminer avec la dette DT-017
  (instantané, ou projection des chats publics) si la route dépasse le budget de
  `perf/budget.json`.
- **F15** : corriger les deux alertes par des surcharges (`overrides` dans
  `pnpm-workspace.yaml`), à condition que `pnpm db:generate` fonctionne encore ; sinon,
  maintenir le risque accepté.
- **F7** : ajouter un test du gestionnaire qui reçoit un identifiant de mouvement étranger.
  L'exigence ne repose aujourd'hui que sur la lecture du code.
- Ajouter un test de deux commandes simultanées sur la même forge. La concurrence optimiste
  (`withOptimisticRetry`) doit n'en laisser passer qu'une, mais aucun test ne le vérifie.

## Vérifications manuelles

À mener connecté dans le navigateur, depuis la console des outils de développement.

- **F11** : gravez un objet de l'inventaire, puis rechargez la forge. Le texte doit
  s'afficher tel quel, sans fenêtre d'alerte.

```js
await (await fetch('/api/forge/engrave', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ itemId: 'item-1', text: '<img src=x onerror=alert(1)>' }),
})).json()
```

La réponse doit être `INVALID_ENGRAVING`, puisque le texte dépasse 20 caractères. Recommencez
avec `<b>gras</b>` (11 caractères) : la gravure doit s'afficher avec ses chevrons, et non en
gras.

- **F12** : la lecture de 21 identifiants doit recevoir l'erreur 400.

```js
(await fetch('/api/forge/cats?ids=' + Array.from({ length: 21 }, (_, i) => 'p' + i).join(','))).status
```