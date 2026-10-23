# Bilan technique de Royaumes

- Date : 2026-10-23
- Version examinée : étiquette `td11-fin`
- Auteur : Pierre-Jean Roggy

Ce bilan dresse l'état technique du projet au terme de son développement, à partir de ses
décisions d'architecture, de ses indicateurs de qualité, de sa dette technique et de ses
revues. Il s'adresse à la personne qui reprendrait le projet.

## 1. Le système livré

| Élément | Valeur |
| --- | --- |
| Modules métier | 5 : `realm`, `dungeon`, `market`, `ranking`, `tavern` (et `system`, technique) |
| Briques de la plateforme | 9 : `auth`, `cron`, `db`, `event-store`, `http`, `outbox`, `privacy`, `projection`, `realtime` |
| Lignes de code, hors tests | Environ 8 260 (`src` et `app`), dont 82 pour le service Village extrait |
| Fichiers de test, nombre de tests | 33 fichiers, 232 tests, tous réussis (`pnpm test:coverage`, 2026-10-23) |
| Commits | 80 à la fin du TD11, tous conformes à Conventional Commits |
| Hébergement | Vercel (Francfort), base Neon (Francfort) |

| Module | Stockage | Lignes, hors tests |
| --- | --- | --- |
| `realm` | Event Sourcing | 1 093, dont le module distant de l'extraction |
| `dungeon` | Event Sourcing, projection des expéditions ouvertes | 2 064 |
| `market` | Event Sourcing, projection des offres, saga | 1 271 |
| `ranking` | Projection du journal | 461 |
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
| 0009 | Extraction du Village, préparée mais non déployée | Tests de contrat à chaque `pnpm verify` | Trop récente pour être éprouvée en production ; trois dettes (DT-008 à DT-010) conditionnent un déploiement. |

## 3. La qualité

| Caractéristique | Indicateur | Valeur | Appréciation |
| --- | --- | --- | --- |
| Adéquation fonctionnelle | Tests réussis ; couverture des domaines | 232 tests sur 232 ; couverture des lignes : 75 % au total | Satisfaisante. Les domaines, fonctions pures, sont les mieux couverts. |
| Efficacité des performances | Débit et p99 des lectures ; respect du budget | p99 entre 79 et 138 ms pour 20 connexions, 0 erreur (`perf/apres.json`) ; budget de 500 ms respecté | Satisfaisante en local. Après l'optimisation des projections, le débit passe de 216 à 295 requêtes/s pour les expéditions ouvertes et de 155 à 224 pour le Marché (`perf/avant.json`). La mesure locale ne prédit pas la production. |
| Fiabilité | Tests de concurrence, de reprise et d'idempotence ; messages abandonnés | Concurrence (journal, Donjon, Marché), reprise après panne, doublons de messages : testés ; lettres mortes examinables (`scripts/dead-letters.ts`) | Satisfaisante. |
| Sécurité | Exigences des revues de sécurité | 37 conformes et 3 en risque accepté, sur 40 exigences | Aucune non-conformité ; les trois risques acceptés sont justifiés dans les revues, et l'un d'eux est consigné comme dette (DT-011). |
| Maintenabilité | Règles d'architecture ; fonctions d'aptitude ; couverture | 0 violation de dependency-cruiser ; 2 fonctions d'aptitude ; 75 % des lignes couvertes | Bonne pour le serveur. L'interface (`ui.tsx`, `src/ui/`) n'est couverte par aucun test automatique : une régression du temps réel côté navigateur ne serait détectée qu'à la main. |
| Flexibilité | Extraction d'un module ; changement de base entre local et production | Village extrait (ADR 0009) ; PGlite en local, Neon en production, choisi par `DATABASE_URL` | Démontrée. |

## 4. La dette technique

| Indicateur | Valeur |
| --- | --- |
| Entrées consignées | 13 |
| Entrées remboursées, dont à l'échéance prévue | 7, toutes à l'échéance prévue (DT-001 à DT-007) |
| Entrées ouvertes | 6 : DT-008 à DT-010 (service extrait), DT-011 à DT-013 (revues de sécurité et RGPD) |

Analyse : chaque dette remboursée l'a été au TD annoncé dans le registre, ce qui montre une
dette pilotée plutôt que subie. Les six entrées ouvertes ont une échéance liée à un événement,
et non à un TD : le déploiement du service Village (ADR 0009), ou l'ouverture du jeu à un
public réel. Aucune ne bloque le fonctionnement actuel. Chacune est signalée dans le code
(`git grep -n "DETTE TECHNIQUE" -- src scripts`).

## 5. Les revues

| Revue | Exigences | Conformes | Non conformes ou en risque accepté | Actions ouvertes |
| --- | --- | --- | --- | --- |
| Sécurité de l'authentification | 16 | 15 | 1 risque accepté (S9) | Aucune |
| Sécurité du Donjon | 14 | 12 | 2 risques acceptés (D10, D14) | DT-011 |
| Sécurité du Marché | 10 | 10 | 0 | Tests automatiques de M6 et M10 à ajouter |
| Conformité au RGPD | 10 | 8 | 1 non conforme (R8), 1 risque accepté (R9) | DT-012, DT-013 ; accord de traitement de Vercel |

Les vérifications manuelles de toutes les revues ont été menées le 2026-10-23. Chaque action
qui demande une modification du code figure au registre de la dette.

## 6. Risques et recommandations

| N° | Risque | Signe avant-coureur | Recommandation |
| --- | --- | --- | --- |
| 1 | La charge des flux temps réel croît avec le nombre de joueurs connectés : deux lectures du journal par seconde et par flux (ADR 0003) | Hausse du nombre de requêtes et du temps de calcul dans le tableau de bord de Neon, à activité de jeu constante | Mesurer la charge par joueur connecté, puis allonger l'intervalle de lecture ou adopter une notification partagée avant d'atteindre le quota de Neon |
| 2 | La croissance du journal allonge la reconstruction des projections et l'effacement d'un compte, exécutés pendant une requête (ADR 0006 et 0008) | Durée d'une reconstruction ou d'un effacement qui approche la durée maximale d'une fonction Vercel | Exécuter les reconstructions par un script avant la mise en service (piste du TD8), et paginer l'effacement |
| 3 | L'interface n'est vérifiée par aucun test automatique | Régression constatée à la main, après un déploiement | Ajouter des tests de bout en bout avec Playwright sur les parcours critiques : connexion, échange au Marché, temps réel |

## 7. Conclusion

Le projet peut être repris et évoluer sans régression côté serveur. Ses frontières sont
vérifiées à chaque construction (dependency-cruiser, fonctions d'aptitude, tests de contrat),
ses 232 tests couvrent 75 % des lignes, et chacune de ses décisions est consignée avec ses
conditions de réexamen. Deux conditions restent à remplir : protéger l'interface par des tests de bout en bout, et
traiter les dettes DT-011 à DT-013, dont la non-conformité R8, avant toute ouverture à un
public réel, avec un hébergement couvert
par un accord de traitement des données.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-23 : rédaction des sections 1 à 7 à partir des documents du
dépôt (ADR, revues, registre de la dette, `perf/avant.json`, `perf/apres.json`), des
résultats de `pnpm test:coverage` fournis par l'auteur, et de comptages effectués sur le dépôt
(nombre de lignes, de fichiers de test et de commits, selon les commandes de la sous-partie
5.2 du TD11). Vérification par l'auteur : relecture de chaque affirmation et de sa source,
nouvelle exécution des commandes de comptage, et vérifications manuelles des revues menées
par l'auteur.
