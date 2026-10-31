# ADR-0015 - Animations de l'interface par Motion, essayées sur la Forge

- Statut : accepté
- Date : 2026-10-31

## Contexte

- Les animations du jeu sont des animations CSS (`@keyframes` dans `app/art.css`), de durée
  fixe. Elles ne peuvent pas être interrompues proprement : une animation relancée repart de
  zéro, et un élément qui change de place saute au lieu de glisser. L'auteur juge le résultat
  peu fluide.
- Plusieurs effets souhaités sont difficiles en CSS seul :
  - un objet qui vole de l'enclume jusqu'à l'inventaire, entre deux composants ;
  - un panneau qui s'efface avant que le suivant n'apparaisse ;
  - un nombre qui défile ;
  - une gerbe d'étincelles soumise à une gravité.
- Le code d'interface est déjà envoyé au navigateur avec chaque écran (DT-014). Toute
  bibliothèque d'animation alourdit ce code.
- La pile de l'atelier mentionne Motion ; le projet ne l'utilisait pas encore.
- Le CSS du projet coupe déjà les animations quand le joueur demande moins de mouvement
  (`prefers-reduced-motion`). Cette accessibilité doit être conservée.

## Décision

- Motion (`motion`, import `motion/react`) est ajouté en version exacte, et essayé sur le seul
  écran de la Forge (pilote).
- Les briques réutilisables sont dans `src/ui/motion.tsx` :
  - `MotionRoot` (préférence « réduire les animations ») ;
  - `Appear` et `Swap` (apparitions et changements d'état) ;
  - `AnimatedNumber` et `Gauge` ;
  - `SparkBurst` et `FloatUp` (effets) ;
  - `Hop` (bond du chat).

  Comme les décors, elles n'ont aucune logique de jeu. Elles sont indépendantes des modules
  métier, qui ne voient que ces composants.
- Les animations suivent des ressorts (`SOFT_SPRING`, `BOUNCY_SPRING`) plutôt que des durées
  fixes, sauf la jauge, linéaire entre deux secondes du compte à rebours.
- L'écran de la Forge utilise :
  - un changement d'état du panneau en fondu ;
  - des recettes qui apparaissent en cascade, et des boutons qui réagissent au survol et au
    clic ;
  - une jauge continue ;
  - un objet prêt qui jaillit sur l'enclume, puis dont l'icône vole jusqu'à l'inventaire
    (`layoutId`) ;
  - un emplacement d'équipement qui rebondit quand il change ;
  - un chat qui fait un bond quand son équipement change ;
  - une gerbe d'étincelles et un niveau qui défile.
- Les autres écrans gardent leurs animations CSS. La décision d'étendre Motion, ou de passer à
  un moteur de rendu comme PixiJS, sera prise au vu du pilote. Cet ADR passera alors au statut
  « accepté » ou « abandonné ».

## Conséquences

### Positives

- Des animations interruptibles : un clic pendant une animation la reprend depuis l'état du
  moment, sans saut.
- Des effets entre composants, comme le vol de l'objet, impossibles en CSS sans mesurer les
  positions à la main.
- La préférence « réduire les animations » est appliquée par `MotionConfig` à tous les
  composants animés. Les étincelles et le bond du chat sont supprimés dans ce cas.
- Les écrans n'importent que `src/ui/motion.tsx` : remplacer la bibliothèque ne toucherait que
  ce fichier.

### Négatives

- Une dépendance de plus dans le code client, qui aggrave DT-014. Le poids réel doit être
  mesuré par `pnpm build`, avant et après.
- Deux systèmes d'animation coexistent pendant le pilote, CSS et Motion. Un même élément ne
  doit pas être animé par les deux, sinon leurs transformations s'écrasent. C'est pourquoi les
  nouveaux effets ont leurs propres classes (`.mfx-*`).
- Les animations ne sont couvertes par aucun test automatique. Seule une vérification visuelle
  les contrôle.

## Alternatives écartées

- **Améliorer les animations CSS** : les courbes peuvent être adoucies, mais ni
  l'interruption, ni le vol entre composants, ni les ressorts ne sont accessibles.
- **GSAP** : très puissant pour les séquences chorégraphiées, mais impératif (références vers
  le DOM), donc moins naturel dans des composants React déclaratifs. À reconsidérer pour les
  combats du Donjon.
- **React Spring** : des ressorts comparables, mais pas d'animations de sortie ni de vol entre
  composants aussi simples.
- **PixiJS (`@pixi/react`)** : un vrai moteur de rendu 2D de jeu. Il demanderait de refaire les
  décors et les personnages en sprites. C'est une refonte, pas un pilote. Le choix sera
  réexaminé au vu de ce pilote.

## Réexamen

- À la fin du pilote : si le résultat convainc, étendre Motion aux autres écrans, puis retirer
  les `@keyframes` remplacés.
- Si `pnpm build` montre une hausse de taille jugée excessive pour la page de la Forge.
- Si le jeu s'oriente vers un rendu de type jeu vidéo (Donjon en sprites) : PixiJS.
Bilan du pilote (2026-10-31) : amélioration jugée légère par l'auteur ; Motion est conservé sur la Forge. 
PixiJS a été écarté pour ce rendu : l'impression de rendu sommaire tient au dessin des décors plus qu'aux animations, et refaire les graphismes dépasse le périmètre.

## Usage de l'IA générative

Claude (Anthropic), le 2026-10-25 : recherche et comparaison des bibliothèques, écriture de
`src/ui/motion.tsx` et des animations de la Forge, rédaction de cet ADR. Le code n'a pas pu être
exécuté avec la bibliothèque réelle dans l'environnement de Claude : il a été vérifié par le
typage et par un rendu statique. Vérification par l'auteur : `pnpm verify`, `pnpm build`
(taille de la page avant et après), essai visuel du parcours « commander, attendre, retirer,
équiper » en local, avec et sans l'option « réduire les animations » du système.
