# Fiche de cadrage : la Forge

- Auteur : Pierre-Jean Roggy
- Date : 23 octobre 2026
- Nom technique du module : `forge`

## L'idée

Au château de son village, le joueur crée l'avatar qui le représente dans le royaume : un chat
chevalier ou un chaton écuyer, dont il choisit le pelage et le regard. À la Forge, il fabrique l'équipement de ce chat : casque, armure, arme et
cape. Chaque recette coûte des ressources de son village (poisson, lait, herbe à chat) et
demande un temps de fabrication. Une fois l'objet retiré de la forge, le joueur peut y graver
un nom, puis l'équiper : son chat le porte alors dans la Forge, dans la Taverne et dans le Donjon,
où les autres joueurs le voient tel qu'il l'a équipé.

La forge est un bâtiment du royaume, visible sur la carte du Village, que le joueur améliore
comme les autres, de 1 à 5. Plus la forge est haute, meilleure est la qualité des objets qui en
sortent (commun, solide, rare, épique, légendaire), et plus leurs bonus sont élevés.

La Forge donne un débouché aux ressources du Village en dehors du Marché. Elle rend visible la
progression du joueur, et prépare l'apport de bonus de combat au Donjon (bonus visé).

## Les règles métier

1. **Recette connue.** Une commande porte sur une recette du catalogue de la Forge ; toute
   autre recette est refusée (`UNKNOWN_RECIPE`).
2. **Un objet à la fois.** Tant qu'une commande attend son paiement ou est en fabrication,
   toute nouvelle commande est refusée (`FORGE_BUSY`).
3. **Inventaire limité.** Une commande est refusée si l'inventaire compte déjà 12 objets
   (`INVENTORY_FULL`).
4. **Paiement par le Village.** Le coût de la recette est prélevé dans le village du joueur.
   Si le Village refuse le prélèvement (stock insuffisant), la commande est rejetée, aucun
   objet n'est fabriqué et les quantités manquantes sont indiquées au joueur.
5. **Durée de fabrication.** La fabrication commence à la confirmation du paiement et dure le
   temps fixé par la recette. L'objet ne peut pas être retiré avant la fin (`NOT_READY`).
6. **Annulation remboursée.** Une commande ne peut être annulée que pendant la fabrication.
   L'annulation rembourse intégralement le coût payé (compensation). Une commande déjà retirée,
   rejetée ou annulée ne peut plus l'être (`NOT_CANCELLABLE`).
7. **Équipement.** Seul un objet de l'inventaire peut être équipé. Chaque emplacement (casque,
   armure, arme, cape) porte au plus un objet : en équiper un nouveau remplace le précédent.
   Un emplacement peut être vidé.
8. **Gravure.** La gravure d'un objet est facultative : de 1 à 20 caractères, espaces de début
   et de fin retirés. Elle ne concerne qu'un objet de l'inventaire du joueur.
9. **Niveau de la forge.** La forge commence au niveau 1 et monte jusqu'au niveau 5. Chaque
   amélioration a un coût croissant, payé par le Village comme une commande (règle 4) ; elle est
   refusée au niveau maximal (`MAX_LEVEL_REACHED`) et pendant une fabrication (`FORGE_BUSY`).
10. **Qualité des objets.** La qualité d'un objet est celle du niveau de la forge au moment de
    la commande, et ne change plus ensuite : améliorer la forge n'améliore pas les objets déjà
    commandés. Le bonus d'un objet est le bonus de base de sa recette multiplié par le
    coefficient de sa qualité.
11. **Réponses du Village idempotentes.** Une réponse du Village déjà prise en compte (même
   identifiant de mouvement) n'a aucun effet : un message livré deux fois ne paie ni ne
   rembourse deux fois.
12. **Allure du chat.** Le joueur choisit une silhouette (chat ou chaton), un pelage et une
    couleur d'yeux, uniquement parmi ceux que propose le jeu (`INVALID_LOOK` sinon). Les autres
    joueurs voient son allure et l'équipement qu'il porte, mais jamais ses gravures.
13. **Paiement sans réponse.** Un travail qui attend la réponse du Village depuis dix minutes
    peut être abandonné par le joueur (`NOT_CANCELLABLE` avant ce délai) : la forge est alors
    libre. Si le Village confirme ensuite le prélèvement, la Forge le rembourse, une seule fois.
    Ajoutée le 2026-10-25, après la revue de sécurité (ADR 0014).
14. **Fonte d'un objet.** Le joueur peut fondre un objet de son inventaire pour libérer sa place.
    La fonte est définitive et ne rend aucune ressource. Un objet porté doit d'abord être ôté
    (`ITEM_EQUIPPED`). L'interface demande une confirmation avant la fonte. Ajoutée le
    2026-10-25 : sans elle, un inventaire plein (règle 3) bloquait définitivement la Forge.

## Les commandes et les lectures

| Action du joueur | Commande ou lecture | Route envisagée |
| --- | --- | --- |
| Voir la forge : recettes, commande en cours, inventaire, équipement | Lecture | `GET /api/forge` |
| Améliorer la forge | Commande `UpgradeForge` | `POST /api/forge/upgrade` |
| Commander un objet | Commande `OrderItem` | `POST /api/forge/orders` |
| Annuler la fabrication en cours, ou abandonner un travail sans réponse du Village | Commande `CancelOrder` | `POST /api/forge/orders/cancel` |
| Retirer l'objet fabriqué | Commande `CollectItem` | `POST /api/forge/collect` |
| Équiper un objet | Commande `EquipItem` | `POST /api/forge/equip` |
| Vider un emplacement | Commande `UnequipSlot` | `POST /api/forge/unequip` |
| Graver un nom sur un objet | Commande `EngraveItem` | `POST /api/forge/engrave` |
| Fondre un objet de l'inventaire | Commande `MeltItem` | `POST /api/forge/melt` |
| Choisir l'allure de son chat (page « Mon chat », depuis le château) | Commande `CustomizeCat` | `POST /api/forge/look` |
| Voir les chats des autres joueurs (Taverne, Donjon) | Lecture | `GET /api/forge/cats?ids=…` |
| Réponse du Village à un prélèvement | Message `forge.transfer-result` | Boîte d'envoi |

Toutes les routes sont réservées aux joueurs connectés, et n'agissent que sur la forge du
joueur de la session : l'identifiant du joueur n'est jamais lu dans la requête.

## Le stockage envisagé

**Journal d'événements**, un flux par joueur (`forge-<playerId>`), selon le modèle decider et
la concurrence optimiste, comme le Village et le Marché.

Raison principale : la Forge est pilotée par une saga, dont chaque étape (commande, paiement
confirmé ou refusé, annulation, remboursement) doit être enregistrée et rejouable ; et
l'historique des objets forgés a une valeur de jeu (registre des fabrications, gravures). Les
données ne sont pas destinées à disparaître rapidement, à la différence de la Taverne (ADR 0008).

## La communication avec les modules existants

- **Village**, dans les deux sens, par **messages de la boîte d'envoi** (saga orchestrée par la
  Forge, comme celle du Marché au TD9) :
  - la Forge envoie `realm.withdraw` pour prélever le coût, avec `replyTo: forge.transfer-result` ;
    le Village répond `withdrawn` ou `refused` ;
  - en cas d'annulation, la Forge envoie `realm.deposit` pour rembourser (étape de compensation).

  L'amélioration de la forge suit la même saga : seul le motif du prélèvement change.

  Le niveau de la forge est conservé par le module Forge, et non par le Village : le domaine du
  Village (catalogue des bâtiments, production, événements déjà enregistrés) et son service
  extrait (TD11) restent intacts. Sur la carte, la forge n'est qu'un repère de l'interface qui
  mène à la page de la Forge.

  Le Village n'est pas modifié : son langage publié accepte déjà ces deux sujets et l'adresse de
  réponse. Les identifiants de mouvement sont construits par la Forge (commande + étape), ce qui
  rend les échanges idempotents des deux côtés.
  
- **Donjon** (bonus B6), par un **port** relié dans la racine de composition : quand un joueur
  crée ou rejoint une expédition, le Donjon demande l'équipement porté par son chat
  (`gearOf`, fourni par la Forge), et en déduit les caractéristiques de son héros. Aucun des
  deux modules n'importe l'autre (ADR 0016).

- **Taverne, Donjon et Classement**, par **composition d'interface** : leurs écrans dessinent les joueurs
  avec le composant `PlayerCat` et le hook `useCats`, exportés par l'entrée publique `ui.tsx`
  de la Forge, qui lisent `GET /api/forge/cats`. Ces modules ne connaissent ni le domaine ni
  le stockage de la Forge ; leur propre code serveur n'est pas modifié.
  Les deux nouveaux appels passent par l’entrée publique @/modules/forge/ui : dependency-cruiser les acceptera. Le podium lira au plus 3 chats, bien sous la limite de 20 par requête.

## Les données personnelles

- Les commandes, l'inventaire et l'équipement du joueur, rattachés à son identifiant.
- Les **gravures**, texte libre saisi par le joueur.

Le contributeur `personal-data.ts` les **exporte**, et **réécrit** les gravures à l'effacement du
compte (même principe que le nom du village, ADR 0008). Un traitement est ajouté au registre des
traitements.

## Les bonus visés

Par ordre de priorité :

1. **B5** : saga avec étape compensable entre la Forge et le Village (prélèvement, puis
   remboursement à l'annulation).
2. **B2** : échéance gérée sans tâche de fond (fin de fabrication calculée à la lecture, comme
   les échéances du Donjon).
3. **B1** : canal temps réel propre au module (`forge-<playerId>`), réservé au propriétaire de
   la forge.
4. **B6** : communication avec un deuxième module, le Donjon, qui lit les bonus d'équipement.
5. **B10** : test de bout en bout avec Playwright, sur le parcours « commander, attendre, retirer,
   équiper ».