# ADR-0016 - L'équipement de la Forge renforce les héros du Donjon, par un port relié à la racine de composition

- Statut : accepté
- Date : 2026-10-31

## Contexte

- La Forge fabrique des objets dotés de bonus d'attaque et de défense, mais ces bonus
  n'avaient aucun effet : le chat équipé était seulement affiché dans le Donjon (ADR 0012).
  La fiche de cadrage annonçait ces bonus de combat comme bonus visé (B6).
- Les héros du Donjon ont des caractéristiques de départ (`HERO` : 30 points de vie, 6
  d'attaque), enregistrées dans l'événement qui les fait entrer (`GameCreated`,
  `PlayerJoined`) : une expédition se rejoue à l'identique (ADR 0004, ADR 0005).
- Un module ne peut utiliser un autre module que par ses entrées publiques. Le domaine reste
  en TypeScript pur, sans accès aux données.
- Le Donjon ne connaît pas de défense : seuls ses points de vie et son attaque comptent.

## Décision

- **Un port dans le Donjon.** `DungeonServiceOptions` reçoit une fonction
  `gearOf(playerId): Promise<HeroGear>`, où `HeroGear` vaut `{ attack, defense }`. Le type
  est défini par le Donjon (`domain/content.ts`), sans aucune mention de la Forge. Sans port
  fourni, aucun bonus n'est appliqué.
- **Une lecture publique dans la Forge.** `createForgeModule` renvoie `gearOf`, qui lit la
  somme des bonus de l'équipement porté (`ForgeView.bonuses`), sans distribuer la boîte
  d'envoi.
- **Le branchement dans la racine de composition.** `create-api.ts` crée la Forge avant le
  Donjon, et passe `forge.gearOf` au Donjon. Aucun des deux modules n'importe l'autre.
- **Un effet calculé par le domaine du Donjon** (`heroSpec`, `domain/rules.ts`) :
  - la moitié du bonus d'attaque s'ajoute à l'attaque, avec un plafond de +6 ;
  - chaque point de défense donne un point de vie, avec un plafond de +15 ;
  - les valeurs négatives sont ignorées.

  Les règles de conversion sont des données de `content.ts` (`GEAR_EFFECT`).
- **Un équipement figé à l'entrée.** L'équipement est lu quand le joueur crée ou rejoint
  l'expédition. Les caractéristiques obtenues sont enregistrées dans l'événement : changer
  d'équipement pendant une expédition ne la modifie pas. Les compagnons n'ont pas
  d'équipement.

## Conséquences

### Positives

- La Forge a enfin un effet de jeu : un objet rare ou légendaire rend le chat plus résistant
  et plus fort.
- Les deux modules restent indépendants, à la compilation comme dans les tests : le Donjon se
  teste avec n'importe quelle fonction `gearOf`, et la Forge ignore l'existence du Donjon.
- Les expéditions restent rejouables, et les anciennes ne changent pas, puisque leurs
  événements portent déjà les caractéristiques `HERO`.
- Les plafonds protègent l'équilibre mesuré par la simulation du Donjon (ADR 0005).

### Négatives

- Rejoindre une expédition fait une lecture de plus : le flux de la forge du joueur est rejoué
  (DT-017).
- Le couplage existe toujours, mais il est déplacé dans la racine de composition. Une erreur de
  la Forge empêcherait de créer ou de rejoindre une expédition.
- L'attaque et la défense de la Forge sont converties en attaque et en points de vie : le
  joueur ne voit dans le Donjon que l'effet sur ses points de vie. L'attaque bonifiée n'est
  pas affichée.
- L'équilibre au niveau difficile n'a pas été mesuré de nouveau avec des héros équipés.

## Alternatives écartées

- **Le Donjon importe `@/modules/forge`** : c'est autorisé par les règles (entrée publique),
  mais le Donjon dépendrait alors de la Forge. Toute évolution de la Forge pourrait casser le
  Donjon, et ses tests auraient besoin d'une Forge.
- **Le Donjon lit les événements de la Forge** (langage publié, comme le Classement) : il
  faudrait une projection de l'équipement porté, disproportionnée pour une lecture faite une
  fois par expédition.
- **Le navigateur transmet ses bonus en rejoignant l'expédition** : un joueur pourrait envoyer
  n'importe quelle valeur. Le serveur doit lire lui-même l'équipement.
- **Une défense qui réduit les dégâts** : il aurait fallu modifier la résolution des manches,
  ses tests et la simulation. Les points de vie donnent un effet comparable sans toucher au
  combat.
- **Lire l'équipement à chaque manche** : l'expédition ne serait plus rejouable, puisque son
  résultat dépendrait d'un état extérieur au moment de la relecture.

## Réexamen

- Si la simulation (`scripts/simulate-dungeon.ts`) montre que des héros équipés rendent le
  niveau difficile trop facile : abaisser les plafonds de `GEAR_EFFECT`.
- Si d'autres modules ont besoin de l'équipement côté serveur : publier une projection des
  chats publics (ADR 0012, Réexamen).

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-31 : conception du port avec l'auteur, écriture du code
(`content.ts`, `rules.ts`, `dungeon-service.ts`, `api.ts`, `index.ts` des deux modules,
`create-api.ts`), des tests (`domain/gear.test.ts`, `src/bootstrap/forge-dungeon.test.ts`) et
de cet ADR. Vérification par l'auteur : `pnpm verify` (dont `pnpm lint:archi`), et une
expédition jouée en local avec un chat équipé, dont les points de vie augmentent.
