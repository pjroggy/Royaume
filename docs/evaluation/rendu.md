# Rendu de l'évaluation

- Auteur : Pierre-Jean Roggy
- Module : `forge`
- Adresse du déploiement : <https://royaume-vert.vercel.app> (à compléter : adresse Vercel de production)
- Fiche de cadrage : [fiche-cadrage.md](fiche-cadrage.md)

## Exigences minimales

Les tests du domaine sont dans `src/modules/forge/domain/forge.test.ts`, une rubrique
`describe` par règle de la fiche (« Règle 1 - recette connue » à « Règle 14 - fonte d'un
objet »). Les tests de l'API sont dans `src/bootstrap/forge-api.test.ts`.

| N° | Fichiers principaux | Tests qui la vérifient |
| --- | --- | --- |
| E1 | `src/modules/forge/` : `domain/` (catalog, forge, saga, view), `application/` (forge-service, forge-repository), `infrastructure/event-store-forge-repository.ts`, `api.ts`, `messages.ts`, `personal-data.ts`, `index.ts`, `contracts.ts`, `ui.tsx` | `pnpm lint:archi` (dependency-cruiser : domaine pur, application sans infrastructure, entrées publiques) |
| E2 | `src/bootstrap/create-api.ts` (`createForgeModule`, routes `/forge`, gestionnaires, canal, données personnelles) ; `src/ui/app-shell.tsx` (entrée « Forge » de la navigation) ; `app/(jeu)/forge/page.tsx`, `app/(jeu)/avatar/page.tsx` | Tous les tests de `forge-api.test.ts`, qui passent par l'application assemblée (`createTestApi`) |
| E3 | `src/modules/forge/domain/forge.ts` (`decide`, `evolve`), `domain/catalog.ts`, `domain/saga.ts`, `domain/view.ts` | `domain/forge.test.ts` : rubriques « Règle 1 » à « Règle 14 », 41 tests |
| E4 | Journal d'événements, modèle decider, un flux `forge-<joueur>` : `infrastructure/event-store-forge-repository.ts` ; aucune table, donc aucune migration (ADR 0010) | Tests du domaine (`replay`, `decide`) ; « prélève le coût dans le village et commence la fabrication » |
| E5 | `src/bootstrap/create-api.ts` (`requireUser` sur `/forge` et `/forge/*`) ; `api.ts` (joueur lu dans `c.var.userId`) ; `contracts.ts` (schémas Zod) | « refuse une requête anonyme (401) » ; « n'agit que sur la forge du joueur connecté » ; « refuse une entrée invalide (400) et une recette inconnue (404) » ; « grave un objet, et refuse une gravure trop longue (400) » ; « enregistre l'allure choisie, et refuse une couleur qui n'est pas proposée (400) » ; « refuse une lecture sans identifiant, ou de plus de vingt chats (400) » |
| E6 | Messages de la boîte d'envoi avec le Village : `domain/saga.ts`, `application/forge-service.ts` (`realm.withdraw`, `realm.deposit`), `messages.ts` (`forge.transfer-result`) ; Village non modifié (ADR 0011) | « prélève le coût dans le village… » ; « rejette la commande, sans rien prélever, lorsque le village ne peut pas payer » ; « rembourse intégralement une fabrication annulée (compensation) » ; « ignore une réponse du Village livrée deux fois… » |
| E7 | `src/modules/forge/personal-data.ts` (export, réécriture des gravures), déclaré dans `create-api.ts` ; traitement T8 du registre | « exporte la forge du joueur, et efface ses gravures avec son compte » ; fonction d'aptitude « déclare les données personnelles de chaque module qui conserve des données » |
| E8 | Correspondance règle par règle : `forge.test.ts` ; chacune des onze routes a au moins un test dans `forge-api.test.ts` | `GET /` : « présente la forge du joueur… » ; `POST /upgrade` : « améliore la forge une fois son coût payé… » ; `POST /orders` et `/orders/cancel` : tests de la saga ; `POST /collect` : « refuse le retrait avant la fin… » ; `POST /equip` et `/unequip` : « équipe un objet, puis vide son emplacement » ; `POST /engrave` : « grave un objet… »  ; `POST /melt` : rubrique « fonte des objets »; `POST /look` et `GET /cats` : rubrique « allure du chat et lecture par les autres modules » |
| E9 | `.dependency-cruiser.cjs` et `src/bootstrap/architecture.test.ts` non modifiés ; la Forge n'est utilisée de l'extérieur que par `@/modules/forge` (racine de composition) et `@/modules/forge/ui` (Taverne, Donjon, Classement, page « Mon chat ») | `pnpm lint:archi` : 0 violation ; `src/bootstrap/architecture.test.ts` |
| E10 | Déploiement Vercel de la branche `main` ; aucune migration propre au module | Vérification manuelle sur la production : commander, attendre, retirer, équiper ; annuler une fabrication et constater le remboursement ; exporter ses données, puis supprimer le compte |

## Bonus revendiqués

| N° | Description | Fichiers | Tests | Documentation |
| --- | --- | --- | --- | --- |
| B1 | Canal temps réel `forge-<joueur>`, réservé au propriétaire de la forge | `src/modules/forge/index.ts` (`channelPolicy`), `ui.tsx` (`useChannel`) | « autorise un joueur à écouter le canal de sa forge, qui transmet ses événements » ; « refuse l'écoute de la forge d'un autre joueur (403) » | ADR 0010 (section B1) ; revue de la Forge, F9 |
| B2 | Fin de fabrication gérée sans tâche de fond : échéance `readyAt` enregistrée, état « prêt » calculé à la lecture, retrait refusé avant l'échéance | `domain/forge.ts`, `domain/view.ts` (`toView`), `src/ui/use-countdown.ts` | Rubrique « Règle 5 - durée de fabrication » ; « refuse le retrait avant la fin de la fabrication, et l'accepte ensuite » | ADR 0010 (section B2) ; revue de la Forge, F8 |
| B5 | Saga avec étape compensable entre la Forge et le Village : prélèvement, puis remboursement intégral à l'annulation | `domain/saga.ts`, `application/forge-service.ts`, `messages.ts` | « rembourse intégralement une fabrication annulée (compensation) » ; rubriques « Règle 6 - annulation remboursée », « Règle 11 - réponses du Village idempotentes » et « Règle 13 - paiement sans réponse » ; « ignore une réponse du Village livrée deux fois… » ; « libère la forge après le délai, puis rembourse un prélèvement confirmé plus tard » | ADR 0011, ADR 0014 ; diagramme de séquence de `docs/architecture.md` ; revue de la Forge, F5 et F6 |

## Écarts avec la fiche de cadrage

- **Bonus de combat au Donjon (B6), non réalisé.** La fiche prévoyait que le Donjon lise les
  bonus de l'équipement porté. Le chat équipé est affiché dans le Donjon, mais ses bonus ne
  modifient pas encore les combats. Faute de temps, la priorité est allée à l'avatar et à son
  affichage. La lecture côté serveur est décrite dans le Réexamen des ADR 0010 et 0012.
- **Test de bout en bout avec Playwright (B10), non réalisé.** L'interface n'est vérifiée qu'à
  la main (risque 3 du bilan technique).
- **Réalisé en plus de la fiche.** Le chat du joueur est aussi affiché sur le podium du
  Classement. Le jeu a reçu un guide et des icônes à la place des émojis (ADR 0013).
- **Composition d'interface.** La fiche l'annonçait pour la Taverne et le Donjon. Elle est
  décrite dans l'ADR 0012 : elle ne relève pas du bonus B6, puisque les serveurs de ces
  modules ne communiquent pas avec la Forge.
- **Règles ajoutées après la validation de la fiche.** La règle 13 (paiement sans réponse du
  Village) corrige un défaut trouvé par la revue de sécurité (F13, ADR 0014). La règle 14
  (fonte d'un objet) corrige un blocage : un inventaire plein empêchait définitivement
  d'utiliser la Forge. Les deux sont décrites dans la fiche, et signalées à l'enseignant.

## Indicateurs au rendu

| Indicateur | À l'étiquette `td11-fin` | Au rendu |
| --- | --- | --- |
| Nombre de tests | 232, dans 33 fichiers | 300, dans 37 fichiers |
| Couverture des lignes | 75 % | 64,96 % |
| Violations des règles d'architecture | 0 | 0 |

La couverture baisse (75 % → 64,96 % des lignes, 50,45 % des branches) alors que les tests
augmentent de 232 à 300. La mesure porte sur tout `src/`, y compris
le code d'interface, qu'aucun test ne charge. Entre les deux mesures, l'habillage graphique
(`src/ui/art/`, environ 6 000 lignes de composants client) et l'interface de la Forge ont été
ajoutés sans test automatique. Le code serveur de la Forge est couvert par 41 tests du domaine
et par les tests de l'API (voir le bilan technique, section 3).

## Usage de l'IA générative

Outil : Claude (Anthropic), utilisé en assistant de conception, de programmation et de
rédaction, du 2026-10-23 au 2026-10-31. Chaque proposition a été livrée sous forme de patch ou
de texte. L'auteur l'a appliquée lui-même, vérifiée, puis enregistrée dans un commit.

| Partie du travail | Contribution de l'IA | Vérification par l'auteur |
| --- | --- | --- |
| Fiche de cadrage | Mise en forme et formulation des règles, à partir de l'idée de l'auteur (forge, avatar du chat) | Relecture ; validation par l'enseignant |
| Domaine, service, API, saga, données personnelles | Écriture du code des patchs `forge-1` à `forge-4` | `pnpm verify` à chaque étape, relecture du code, parcours manuel en local et en production |
| Tests | Écriture des tests du domaine (33) et de l'API de la Forge | Exécution ; contrôle de la correspondance entre chaque règle de la fiche et sa rubrique de test |
| Interface (Forge, « Mon chat », chat dans la Taverne, le Donjon et le Classement), icônes, guide, habillage graphique | Écriture du code ; choix des icônes parmi Game-icons.net | Contrôle visuel avec deux comptes, en thème de jour et de nuit. Une erreur de typage non détectée par l'outil de l'IA (allure du chat) a été trouvée par `tsc`, puis corrigée |
| ADR 0010 à 0013, architecture, README, revue de sécurité, registre de la dette et des traitements, bilan, ce document | Rédaction à partir du code et des tests, avec vérification par l'IA des noms d'événements et de tests cités | Relecture de chaque affirmation face au code ; vérifications manuelles de la revue de sécurité ; affichage des diagrammes Mermaid sur GitHub |
| Analyse des vulnérabilités (`pnpm audit`) | Diagnostic (dépendances de développement transitives) et proposition de surcharges | Décision de l'auteur, consignée dans la revue de la Forge (F15) |
| Règles 13 et 14 (paiement sans réponse, fonte d'un objet) | Conception avec l'auteur, code, tests, ADR 0014 | `pnpm verify`. Un test de la fonte, qui attendait un stock erroné (temps de fabrication oublié), a échoué sur le poste de l'auteur, puis a été corrigé |
| Pilote d'animations Motion (ADR 0015) | Recherche des bibliothèques, code de `src/ui/motion.tsx` et des animations de la Forge, écrit sans pouvoir être exécuté par l'IA | Essai visuel en local ; verdict de l'auteur : amélioration légère, PixiJS écarté |
| Confirmation de la fonte | Composant `src/ui/confirm-dialog.tsx` | Essai manuel : confirmation, annulation par Échap, focus sur « Annuler » |

Les décisions de conception qui viennent de l'auteur : le thème du module, l'avatar créé
depuis le château et équipé à la Forge, le remplacement des émojis par des icônes, et l'ajout
d'un guide du jeu.