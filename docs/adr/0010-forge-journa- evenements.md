# ADR-0010 - La Forge stockée dans le journal d'événements, un flux par joueur

- Statut : accepté
- Date : 2026-10-25

## Contexte

- La Forge (fiche de cadrage, `docs/evaluation/fiche-cadrage.md`) conserve pour chaque joueur
  le niveau de sa forge, le travail en cours, un inventaire de 12 objets au plus, l'équipement
  porté sur quatre emplacements, les gravures et l'allure du chat.
- Une commande traverse plusieurs étapes séparées dans le temps : commande, réponse du Village
  (paiement confirmé ou refusé), fabrication, puis retrait ou annulation remboursée. Entre deux
  étapes, le processus serverless peut s'arrêter. Chaque étape doit donc être enregistrée
  durablement, avec les messages qu'elle déclenche, et la saga doit pouvoir reprendre
  (ADR 0007).
- La fin d'une fabrication est une échéance. Vercel Hobby n'offre ni tâche de fond ni minuteur
  en mémoire, seulement une tâche quotidienne (ADR 0004).
- La plateforme fournit déjà un journal d'événements avec concurrence optimiste, ajout
  atomique d'événements et de messages de la boîte d'envoi (`EventStore.append`), canaux temps
  réel alimentés par les flux (ADR 0003) et réécriture ciblée des champs personnels
  (ADR 0008). Le Village, le Donjon et le Marché l'utilisent.
- Les gravures sont un texte libre saisi par le joueur : ce sont des données personnelles, qui
  doivent pouvoir être effacées, alors que le journal suit la règle de l'ajout seul (ADR 0002).

## Décision

- Chaque forge est un flux du journal, `forge-<playerId>`. Il contient onze types
  d'événements (`ItemOrdered`, `UpgradeOrdered`, `PaymentConfirmed`, `PaymentRefused`,
  `ForgeUpgraded`, `OrderCancelled`, `ItemCollected`, `ItemEquipped`, `SlotEmptied`,
  `ItemEngraved`, `CatCustomized`). Ils portent toutes les valeurs nécessaires à la
  reconstruction : coût payé, qualité, échéance `readyAt`.
- Le domaine suit le modèle decider (`src/modules/forge/domain/forge.ts`) : `decide(état,
  commande, maintenant)` renvoie des événements ou une erreur métier, et `evolve` les applique.
  Il est écrit en TypeScript pur et n'importe aucun autre module.
- Le service enregistre les événements et les messages de la saga dans un seul appel à
  `EventStore.append`, donc dans une même transaction. Il rejoue la décision en cas de conflit
  de version (`withOptimisticRetry`).
- **Échéance paresseuse (bonus B2).** Aucun événement ne marque la fin d'une fabrication :
  `readyAt` est enregistré à la confirmation du paiement. La vue calcule l'état « prêt » à
  l'instant de la lecture (`toView`), et `decide` refuse le retrait avant l'échéance
  (`NOT_READY`). L'interface relit la forge à l'échéance grâce à un compte à rebours.
- **Canal temps réel (bonus B1).** Le canal de la forge porte le nom de son flux. Sa règle
  d'accès (`index.ts`) ne laisse un joueur écouter que sa propre forge.
- Le niveau de la forge appartient à la Forge, et non au Village : le domaine du Village et son
  service extrait (ADR 0009) ne sont pas modifiés. La forge n'est qu'un repère sur la carte.
- Le contributeur `personal-data.ts` exporte la forge du joueur. À l'effacement du compte, il
  réécrit le texte des événements `ItemEngraved` en « Gravure effacée », par la fonction de
  réécriture de la plateforme (ADR 0008).
- Le module ne crée aucune table et aucune migration : il n'utilise que `platform.events` et
  `platform.outbox`.

## Conséquences

### Positives

- L'état de la saga est durable par construction : un arrêt entre deux étapes ne perd rien, et
  la reprise relit le flux.
- Les douze règles métier sont testées sur le domaine pur, sans base ni réseau
  (`domain/forge.test.ts`, 33 tests), et l'échéance se teste en passant l'heure en argument.
- L'idempotence des réponses du Village se déduit de l'état reconstruit : une réponse pour un
  travail qui n'attend plus de paiement n'a aucun effet (règle 11).
- Le canal temps réel et sa règle d'accès sont obtenus sans code de plateforme nouveau.
- L'historique des fabrications reste disponible : un registre des objets forgés, ou une
  projection pour le Classement, pourra être construit sans migration.

### Négatives

- Chaque lecture rejoue tout le flux du joueur. Le flux grandit à chaque équipement, gravure
  ou changement d'allure, sans aucun instantané : le coût d'une lecture augmente avec
  l'ancienneté du joueur.
- `GET /api/forge/cats` rejoue jusqu'à vingt flux par requête (ADR 0012). C'est la lecture la
  plus coûteuse du module.
- La forme des événements est définitive : changer la palette des couleurs ou le catalogue des
  recettes doit rester compatible avec les événements déjà enregistrés. Un événement qui cite
  une couleur ou une recette retirée devrait être traduit à la lecture (upcasting).
- L'état « prêt » n'existe que dans la vue. Une projection ou un autre module qui lirait le
  flux ne verrait pas qu'un objet est prêt, sans refaire le calcul avec l'heure.
- L'effacement réécrit le journal : la liste des champs personnels (`ItemEngraved.text`) doit
  être tenue à jour à chaque nouvel événement qui contiendrait du texte libre.

## Alternatives écartées

- **Tables classiques dans un schéma `forge`** (forge, travaux, objets), mises à jour par
  Drizzle. Les lectures de `GET /cats` seraient plus simples. Mais il faudrait écrire une
  machine à états du travail en cours, l'enregistrer avec la boîte d'envoi dans une transaction
  écrite à la main, et l'historique des étapes de la saga serait perdu. Le journal offre tout
  cela déjà, et le Marché a montré le modèle au TD9.
- **Journal avec instantanés** (snapshots) : ils réduiraient le coût de lecture, mais aucun
  flux de forge n'est assez long aujourd'hui pour le justifier, et le projet n'a pas encore
  d'instantanés à réutiliser.
- **Niveau de la forge comme bâtiment du Village** : il aurait fallu modifier le catalogue et
  les événements du Village, ainsi que son service extrait, pour une donnée que seule la Forge
  utilise.
- **Minuteur ou tâche de fond à la fin de chaque fabrication** : impossible sur Vercel Hobby.
  La tâche quotidienne serait beaucoup trop lente pour une fabrication de quelques minutes.
- **Événement `ItemReady` enregistré par la première lecture après l'échéance** : une lecture
  écrirait dans le journal, et deux lectures simultanées entreraient en conflit, pour une
  information que l'heure suffit à calculer.

## Réexamen

- Si un flux de forge dépasse quelques centaines d'événements, ou si `GET /api/forge/cats`
  dépasse le budget de `perf/budget.json` : ajouter un instantané, ou un modèle de lecture des
  chats publics tenu par une projection (ADR 0006).
- Si le Donjon doit appliquer les bonus d'équipement côté serveur (bonus B6) : exposer une
  lecture des bonus dans `index.ts`, ou une projection, plutôt qu'un rejeu à chaque manche.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-25 : rédaction de cet ADR à partir de la fiche de cadrage et du
code du module (`src/modules/forge/domain/forge.ts`, `domain/view.ts`,
`application/forge-service.ts`, `index.ts`, `personal-data.ts`). Le domaine, le service et les
tests de la Forge ont également été écrits avec Claude. Vérification par l'auteur : relecture
de l'ADR, contrôle des noms d'événements dans `domain/forge.ts`, exécution de `pnpm verify`,
et parcours « commander, attendre, retirer » sur le déploiement.