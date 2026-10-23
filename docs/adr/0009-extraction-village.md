# ADR-0009 - Extraction du Village en service autonome, préparée mais non déployée

- Statut : accepté
- Date : 2026-10-23

## Contexte

- L'ADR 0001 a promis des frontières entre modules assez strictes pour qu'un module puisse
  être extrait en service autonome. Tant qu'aucune extraction n'avait été tentée, cette
  promesse restait une hypothèse.
- Les raisons habituelles d'extraire un module sont un rythme de déploiement propre, une
  mise à l'échelle sélective, une équipe autonome ou une technologie différente. Aucune ne
  s'applique aujourd'hui au jeu : une seule personne le développe, la charge est modeste,
  et l'offre gratuite de Vercel et Neon diviserait ses quotas entre deux déploiements.
- Le Village est le meilleur candidat : son domaine ne dépend d'aucun autre module, il ne
  lit les données d'aucun autre, et sa relation avec le Marché passe déjà par les messages
  de la saga (ADR 0007).
- L'inventaire des dépendances du Village en fait apparaître deux qui ne passent pas par le
  code, et qu'aucune règle de dependency-cruiser ne signale : le Classement et le canal
  temps réel lisent ses événements directement dans le journal commun (langage publié,
  ADR 0006).

## Décision

- Le Village peut s'exécuter dans un service autonome (`src/services/village/`, démarré par
  `scripts/village-service.ts` sur le port 4000), doté de sa propre base, de son propre
  journal et de sa propre boîte d'envoi.
- L'application devient alors une passerelle : la racine de composition reçoit une version
  distante du module Village (`src/modules/realm/remote.ts`), de même forme que la version
  exécutée dans le processus (API, règle du canal, gestionnaires de messages, données
  personnelles).
- Les messages de la saga franchissent la frontière par une boîte de réception
  (`src/platform/outbox/inbox-api.ts`), sans modifier les garanties de la boîte d'envoi :
  livraison au moins une fois, gestionnaires idempotents.
- Un relais recopie le flux d'événements publié par le service dans le journal de
  l'application, avec son propre point de reprise ; le Classement et le canal temps réel
  continuent de le lire sans modification.
- Les échanges entre les deux processus sont authentifiés par un secret partagé
  (`SERVICE_SECRET`, `src/platform/http/service-auth.ts`), qui n'est jamais versionné.
- Le choix entre les deux versions est fait au démarrage : avec `REALM_SERVICE_URL` et
  `SERVICE_SECRET`, le Village est distant ; sans elles, il s'exécute dans l'application.
- Le service n'est pas déployé : en production, le Village s'exécute dans l'application.

## Conséquences

### Positives

- Les frontières du monolithe sont démontrées, et non plus supposées : le Village
  fonctionne dans un autre processus, échanges du Marché compris, sans modification de son
  domaine ni des autres modules.
- Six tests de contrat (`src/bootstrap/village-service.test.ts`) vérifient ces frontières à
  chaque exécution de `pnpm verify` : une modification qui les romprait est détectée avant
  le déploiement.
- L'extraction est réversible sans migration de données : il suffit de retirer deux
  variables d'environnement pour revenir au Village exécuté dans l'application.
- La boîte de réception et l'authentification entre services sont des briques de la
  plateforme, réutilisables pour tout autre module.
- Le coût réel d'une extraction est connu et mesuré (code ajouté, dettes consignées), ce
  qui permettra de décider d'un déploiement en connaissance de cause.

### Négatives

- Deux chemins d'exécution du Village sont à maintenir, l'un dans le processus, l'autre
  distant ; toute évolution du module doit être vérifiée dans les deux.
- Les événements du Village sont copiés dans le journal de l'application : en mode distant,
  le Classement et le canal temps réel voient ces événements avec un retard qui dépend du
  relais (cohérence différée).
- Des dettes doivent être remboursées avant tout déploiement du service : migrations
  propres au service (DT-008), pagination du flux publié (DT-009), distribution périodique
  de sa boîte d'envoi (DT-010).
- L'authentification par secret partagé est fragile : en cas de fuite, le secret permet de
  se faire passer pour n'importe quel joueur auprès du service, puisque l'identifiant du
  joueur est transmis dans un en-tête.
- Une commande du Village en mode distant ajoute un aller-retour réseau, et le service
  peut être indisponible alors que l'application fonctionne.

## Alternatives écartées

- **Déployer le service** : aucune raison d'extraire ne s'applique, et un second
  déploiement doublerait l'exploitation (base, secrets, journaux à surveiller), diviserait
  les quotas gratuits et ajouterait la latence réseau, sans bénéfice pour les joueurs.
- **Ne pas extraire, et laisser les frontières à l'état d'hypothèse** : les dépendances
  cachées, comme la lecture du journal par le Classement, ne seraient découvertes qu'au
  moment d'une extraction réellement nécessaire, sous contrainte de délai.
- **Faire lire à distance le flux publié par le Classement et le canal temps réel** : il
  faudrait modifier la plateforme des projections et du temps réel pour un cas particulier,
  et chaque lecture dépendrait de la disponibilité du service ; le relais garde ces deux
  lecteurs inchangés.
- **Extraire un autre module, comme le Marché** : sa saga lie son sort à celui du Village,
  et il lit des contrats du Village ; l'extraction aurait été plus coûteuse et moins
  démonstrative.
- **Un jeton signé (JWT) ou le TLS mutuel pour authentifier les échanges** : plus sûrs face
  à une fuite, mais ils demandent une gestion de clés ou de certificats injustifiée pour un
  service qui n'est pas déployé ; ils sont à reconsidérer avant tout déploiement.

## Réexamen

Cette décision devra être réexaminée, au profit d'un service déployé, si l'une des raisons
d'extraire devient observable :

- le test de charge (`scripts/load-test.ts`) montre que le Village dépasse le budget de
  `perf/budget.json` alors que les autres modules le respectent ;
- une seconde équipe est chargée du Village, ou le Village doit être déployé plus souvent
  que le reste du jeu ;
- le Village a besoin d'une capacité ou d'une technologie que l'application ne peut pas lui
  offrir.

Avant tout déploiement, les dettes DT-008 à DT-010 doivent être remboursées et
l'authentification entre services renforcée.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-23 : rédaction des rubriques Conséquences, Alternatives
écartées et Réexamen, compléments du Contexte et de la Décision (noms de fichiers et de
variables), et correction de l'en-tête, à partir des éléments imposés par la sous-partie 5.1
du TD11 et de la lecture du code (`src/modules/realm/remote.ts`,
`src/services/village/`, `src/bootstrap/server.ts`). Vérification par l'auteur : relecture,
contrôle des noms de variables dans `src/bootstrap/server.ts` et `.env.example`, et
exécution des six tests de contrat par `pnpm test`.