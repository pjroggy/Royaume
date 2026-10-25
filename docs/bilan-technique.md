# Bilan technique de Royaumes

- Date : 2026-10-23, mis à jour le 2026-10-25
- Versions examinées : étiquette `td11-fin`, puis étiquette `eval-fin` (module Forge)
- Auteur : Pierre-Jean Roggy

Ce bilan dresse l'état technique du projet au terme de son développement, à partir de ses
décisions d'architecture, de ses indicateurs de qualité, de sa dette technique et de ses
revues. Il s'adresse à la personne qui reprendrait le projet.

## 1. Le système livré

| Élément | À `td11-fin` | À `eval-fin` |
| --- | --- | --- |
| Modules métier | 5 : `realm`, `dungeon`, `market`, `ranking`, `tavern` (et `system`, technique) | 6 : ajout de `forge` |
| Briques de la plateforme | 9 : `auth`, `cron`, `db`, `event-store`, `http`, `outbox`, `privacy`, `projection`, `realtime` | 9, inchangées |
| Lignes de code, hors tests | Environ 8 260 (`src` et `app`), dont 82 pour le service Village extrait | Environ 17 900, dont environ 6 200 pour l'interface partagée `src/ui` (habillage graphique, icônes, guide) et 1 950 pour la Forge |
| Fichiers de test, nombre de tests | 33 fichiers, 232 tests, tous réussis | 37 fichiers, 295 tests, tous réussis (`pnpm test:coverage`, 2026-10-25) |
| Commits | 80 à la fin du TD11, tous conformes à Conventional Commits | 102, tous conformes à Conventional Commits |
| Hébergement | Vercel (Francfort), base Neon (Francfort) | Inchangé |

| Module | Stockage | Lignes, hors tests |
| --- | --- | --- |
| `realm` | Event Sourcing | 1 093, dont le module distant de l'extraction |
| `dungeon` | Event Sourcing, projection des expéditions ouvertes | 2 064 |
| `market` | Event Sourcing, projection des offres, saga | 1 271 |
| `ranking` | Projection du journal | 461 (553 à `eval-fin`, podium dessiné) |
| `forge` | Event Sourcing, saga avec le Village | 1 951, dont environ 700 pour l'interface (`ui.tsx`) |
| `tavern` | Tables ordinaires | 678 |
| `system` | Aucun | 73 |

## 2. Les décisions d'architecture

| ADR | Décision | Mise à l'épreuve | Bilan |
| --- | --- | --- | --- |
| 0001 | Monolithe modulaire | Extraction du Village (TD11) | A tenu : le Village fonctionne dans un autre processus sans modification de son domaine ni des autres modules (6 tests de contrat). Prix : deux dépendances cachées, la lecture du journal par le Classement et par le canal temps réel, ont demandé un relais. |
| 0002 | Event Sourcing pour le Village | Ajout des projections (TD8), puis de l'effacement (TD10) | A tenu : le Classement a été calculé pour tout le passé sans migration. Prix : l'effacement a exigé une exception à l'ajout seul (ADR 0008). |
| 0003 | Server-Sent Events alimentés par le journal | Canaux des expéditions, du Classement, du Marché et de la Taverne (TD6 à TD10) | A tenu : chaque module a déclaré ses canaux sans modifier le mécanisme. Prix : deux lectures par seconde et par flux ouvert ; le canal à source propre de la Taverne a dû être ajouté. |
| 0004 | Manches simultanées et échéances paresseuses | Écritures concurrentes de quatre héros ; compagnons (TD7) | A tenu (test « enregistre les actions de quatre héros… »). Limite confirmée : une expédition abandonnée n'enregistre jamais sa fin. |
| 0005 | Intelligence artificielle déterministe | Simulation de 200 expéditions (`scripts/simulate-dungeon.ts`) | A tenu : décisions reproductibles et testées. La simulation a révélé un déséquilibre (quatre joueurs restent avantagés au niveau difficile), décrit dans le README. |
| 0006 | CQRS et projections rattrapées à la lecture | Évolution de version (meilleur butin) ; mesure de performance (TD11) | A tenu : reconstruction automatique au déploiement. La mesure a conduit à une optimisation (aucune transaction pour une projection à jour) : jusqu'à +45 % de débit pour le Marché. |
| 0007 | Saga orchestrée et boîte d'envoi | Panne du service Village (TD11) | A tenu : la saga reprend après la panne sans créer ni perdre de ressource (test « reprend la saga du Marché après une panne du service »). La dette des lettres mortes (DT-007) a été remboursée. |
| 0008 | Taverne sans Event Sourcing, réécriture ciblée du journal | Effacement d'un compte et reconstruction du classement | A tenu : le classement reconstruit est identique après effacement (test). Prix : chaque nouvel événement doit déclarer ses champs personnels. |
| 0009 | Extraction du Village, préparée mais non déployée | Tests de contrat à chaque `pnpm verify` ; saga de la Forge | Trop récente pour être éprouvée en production ; trois dettes (DT-008 à DT-010) conditionnent un déploiement. La Forge a été ajoutée sans modifier le Village, ce qui préserve l'extraction. |
| 0010 | La Forge dans le journal d'événements, un flux par joueur | Ajout de l'allure du chat (règle 12) après la première version ; effacement des gravures | A tenu : l'allure n'a demandé qu'un événement de plus, sans migration. Prix : rejeu complet à chaque lecture, jusqu'à vingt flux par `GET /cats` (DT-017). |
| 0011 | Saga de paiement orchestrée par la Forge | Réponse du Village livrée deux fois (test) ; annulation remboursée | A tenu pour l'idempotence et la compensation. La revue de sécurité a révélé un défaut de conception : un prélèvement abandonné bloquait la forge (F13, DT-015). Corrigé par l'ADR 0014, qui complète la saga d'une échéance et d'une seconde compensation. |
| 0014 | Délai de réponse du Village et remboursement d'un prélèvement tardif | Panne simulée du service Village pendant un paiement (test de l'API) | A tenu : la forge est libérée, et le prélèvement confirmé après l'abandon est remboursé une fois. Prix : un événement et un état de plus, et un remboursement qui reste sans accusé (DT-016). |
| 0012 | Chat du joueur tenu par la Forge, affiché par composition d'interface | Ajout du podium du Classement et de l'entrée du Donjon, après la Taverne | A tenu : deux écrans de plus sans toucher aux serveurs. Prix : le chat par défaut apparaît un instant (DT-018), et une erreur de typage entre le domaine et l'API n'a été vue que par `tsc`. |
| 0013 | Icônes Game-icons.net à la place des émojis | Remplacement de toutes les icônes | A tenu : seuls trois fichiers de `src/ui` ont changé, ce qui confirme la couche de thème (ADR 0002). Trop récente pour juger son coût d'entretien. |

## 3. La qualité

| Caractéristique | Indicateur | Valeur | Appréciation |
| --- | --- | --- | --- |
| Adéquation fonctionnelle | Tests réussis ; couverture des domaines | `td11-fin` : 232 tests sur 232, 75 % des lignes. `eval-fin` : 289 tests sur 289, 66,18 % des lignes (64,76 % des instructions, 50,92 % des branches) | Satisfaisante pour le serveur : les douze règles de la Forge ont chacune leur rubrique de test, et ses dix routes leurs tests de l'API. La baisse de la couverture vient du code d'interface ajouté sans test (habillage graphique, interface de la Forge), mesuré par `pnpm test:coverage` comme le reste de `src/`. |
| Efficacité des performances | Débit et p99 des lectures ; respect du budget | p99 entre 79 et 138 ms pour 20 connexions, 0 erreur (`perf/apres.json`) ; budget de 500 ms respecté | Satisfaisante en local. Après l'optimisation des projections, le débit passe de 216 à 295 requêtes/s pour les expéditions ouvertes et de 155 à 224 pour le Marché (`perf/avant.json`). La mesure locale ne prédit pas la production. |
| Fiabilité | Tests de concurrence, de reprise et d'idempotence ; messages abandonnés | Concurrence (journal, Donjon, Marché), reprise après panne, doublons de messages : testés ; lettres mortes examinables (`scripts/dead-letters.ts`) | Satisfaisante. |
| Sécurité | Exigences des revues de sécurité | `td11-fin` : 37 conformes et 3 en risque accepté, sur 40. `eval-fin` : 50 conformes et 5 en risque accepté, sur 55 | La seule non-conformité trouvée par la revue de la Forge (F13, forge bloquée par un prélèvement abandonné) a été corrigée et testée (ADR 0014). |
| Maintenabilité | Règles d'architecture ; fonctions d'aptitude ; couverture | 0 violation de dependency-cruiser, à `td11-fin` comme à `eval-fin`, sans modification de la configuration ; 2 fonctions d'aptitude, que la Forge respecte ; 66 % des lignes couvertes | Bonne pour le serveur. L'interface (`ui.tsx`, `src/ui/`) n'est couverte par aucun test automatique, alors qu'elle porte désormais le chat de la Forge dans quatre modules (ADR 0012) : une régression ne serait détectée qu'à la main. |
| Flexibilité | Extraction d'un module ; changement de base entre local et production | Village extrait (ADR 0009) ; PGlite en local, Neon en production, choisi par `DATABASE_URL` | Démontrée. |

## 4. La dette technique

| Indicateur | Valeur |
| --- | --- |
| Entrées consignées | 19 (13 à `td11-fin`, puis DT-014 pour l'habillage graphique et DT-015 à DT-019 pour la Forge) |
| Entrées remboursées, dont à l'échéance prévue | 8, toutes à l'échéance prévue (DT-001 à DT-007, DT-015) |
| Entrées ouvertes | 11 : DT-008 à DT-010 (service extrait), DT-011 à DT-013 (revues de sécurité et RGPD), DT-014 et DT-018 à DT-019 (interface), DT-016 à DT-017 (Forge) |

Analyse : chaque dette remboursée l'a été au TD annoncé dans le registre, ce qui montre une
dette pilotée plutôt que subie. La Forge ajoute cinq dettes. La plus grave, DT-015 (forge
bloquée par un prélèvement abandonné), a été remboursée le jour même de sa découverte par la
revue de sécurité. DT-016 ne se manifeste qu'avec un remboursement abandonné, que la tâche
quotidienne signale et que `scripts/dead-letters.ts` permet de relancer. Les entrées ouvertes ont une échéance liée à un événement,
et non à un TD : le déploiement du service Village (ADR 0009), ou l'ouverture du jeu à un
public réel. Aucune ne bloque le fonctionnement actuel. Chacune est signalée dans le code
(`git grep -n "DETTE TECHNIQUE" -- src scripts`).

## 5. Les revues

| Revue | Exigences | Conformes | Non conformes ou en risque accepté | Actions ouvertes |
| --- | --- | --- | --- | --- |
| Sécurité de l'authentification | 16 | 15 | 1 risque accepté (S9) | Aucune |
| Sécurité du Donjon | 14 | 12 | 2 risques acceptés (D10, D14) | DT-011 |
| Sécurité du Marché | 10 | 10 | 0 | Tests automatiques de M6 et M10 à ajouter |
| Sécurité de la Forge | 15 | 13 | 2 risques acceptés (F12, F15) ; F13, non conforme, corrigée | DT-017 ; tests de F7 et des commandes simultanées à ajouter ; alertes `pnpm audit` |
| Conformité au RGPD | 10 | 8 | 1 non conforme (R8), 1 risque accepté (R9) | DT-012, DT-013 ; accord de traitement de Vercel |

Les vérifications manuelles de toutes les revues ont été menées le 2026-10-23. Chaque action
qui demande une modification du code figure au registre de la dette.

## 6. Risques et recommandations

| N° | Risque | Signe avant-coureur | Recommandation |
| --- | --- | --- | --- |
| 1 | La charge des flux temps réel croît avec le nombre de joueurs connectés : deux lectures du journal par seconde et par flux (ADR 0003) | Hausse du nombre de requêtes et du temps de calcul dans le tableau de bord de Neon, à activité de jeu constante | Mesurer la charge par joueur connecté, puis allonger l'intervalle de lecture ou adopter une notification partagée avant d'atteindre le quota de Neon |
| 2 | La croissance du journal allonge la reconstruction des projections et l'effacement d'un compte, exécutés pendant une requête (ADR 0006 et 0008) | Durée d'une reconstruction ou d'un effacement qui approche la durée maximale d'une fonction Vercel | Exécuter les reconstructions par un script avant la mise en service (piste du TD8), et paginer l'effacement |
| 3 | L'interface n'est vérifiée par aucun test automatique, alors qu'elle porte le chat de la Forge dans quatre modules | Régression constatée à la main, après un déploiement | Ajouter des tests de bout en bout avec Playwright sur les parcours critiques : connexion, échange au Marché, commande à la Forge, temps réel |
| 4 | Un remboursement de la Forge abandonné dans la boîte d'envoi n'est signalé ni à la Forge ni au joueur (DT-016) | Message `realm.deposit` dans la liste de `scripts/dead-letters.ts` | Faire répondre le Village aux remboursements, et afficher au joueur un remboursement en attente |

## 7. Conclusion

Le projet peut être repris et évoluer sans régression côté serveur. Ses frontières sont
vérifiées à chaque construction (dependency-cruiser, fonctions d'aptitude, tests de contrat),
et chacune de ses décisions est consignée avec ses conditions de réexamen. L'ajout de la Forge
l'a confirmé : un sixième module, une saga avec le Village et un affichage dans quatre autres
modules, sans modifier le Village ni les règles d'architecture, et avec 57 tests de plus.

Trois conditions restent à remplir avant toute ouverture à un public réel : protéger
l'interface par des tests de bout en bout, maintenant qu'elle porte le chat du joueur dans
tout le jeu ; signaler les remboursements de la Forge restés sans accusé (DT-016) ; traiter
les dettes DT-011 à DT-013, dont la non-conformité R8, avec un hébergement couvert par un
accord de traitement des données. La seule non-conformité de la revue de la Forge (F13) a été
corrigée avant le rendu.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-25 : mise à jour des sections 1 à 6 pour le module Forge, à
partir des ADR 0010 à 0013, de la revue de sécurité de la Forge, du registre de la dette, des
résultats de `pnpm test:coverage` fournis par l'auteur, et d'un comptage des lignes. Mêmes
vérifications que ci-dessous.

Claude (Anthropic), le 2026-10-23 : rédaction des sections 1 à 7 à partir des documents du
dépôt (ADR, revues, registre de la dette, `perf/avant.json`, `perf/apres.json`), des
résultats de `pnpm test:coverage` fournis par l'auteur, et de comptages effectués sur le dépôt
(nombre de lignes, de fichiers de test et de commits, selon les commandes de la sous-partie
5.2 du TD11). Vérification par l'auteur : relecture de chaque affirmation et de sa source,
nouvelle exécution des commandes de comptage, et vérifications manuelles des revues menées
par l'auteur.