import { at, withVars } from './scene'

/*
 * Effets visuels joués une fois, en réponse à une action du joueur. Pour rejouer un effet,
 * le composant parent change sa clé (key) : React crée un nouvel élément, et l'animation CSS
 * repart du début. Les effets sont masqués aux lecteurs d'écran, qui reçoivent déjà le
 * résultat de l'action sous forme de texte.
 */

/** Directions des étincelles d'une gerbe, en pixels. */
const SPARKS = [
  [-60, -30],
  [58, -36],
  [-26, -64],
  [30, -60],
  [0, -76],
  [-54, 22],
  [52, 24],
  [8, 40],
]

/** Anneau lumineux et gerbe d'étincelles, centrés sur un point du décor. */
export function Burst({ left, top }: { left: string; top: string }) {
  return (
    <span className="fx" style={at(left, top)} aria-hidden="true">
      <span className="fx-ring" />
      {SPARKS.map(([dx, dy]) => (
        <span
          key={`${dx}:${dy}`}
          className="fx-spark"
          style={withVars({ '--dx': `${dx}px`, '--dy': `${dy}px` })}
        />
      ))}
    </span>
  )
}

/** Texte qui s'envole : dégâts, soins, niveau atteint... */
export function FloatText({
  left,
  top,
  text,
  tone = 'gold',
}: {
  left: string
  top: string
  text: string
  tone?: 'gold' | 'damage' | 'heal'
}) {
  return (
    <span className={`fx-float fx-${tone}`} style={at(left, top)} aria-hidden="true">
      {text}
    </span>
  )
}

/** Petits cœurs qui montent : un chat caressé, un soin reçu. */
export function Hearts({
  left,
  top,
  tone = 'pink',
}: {
  left: string
  top: string
  tone?: 'pink' | 'green'
}) {
  return (
    <span className={`fx fx-hearts-${tone}`} style={at(left, top)} aria-hidden="true">
      {[-30, 24, -6, 12].map((dx, i) => (
        <span
          key={dx}
          className="fx-heart"
          style={withVars({ '--dx': `${dx}px`, '--delay': `${i * 0.15}s` })}
        >
          ♥
        </span>
      ))}
    </span>
  )
}

/** Pièces qui jaillissent : un échange conclu, un butin. */
export function Coins({ left, top }: { left: string; top: string }) {
  return (
    <span className="fx" style={at(left, top)} aria-hidden="true">
      {SPARKS.map(([dx, dy]) => (
        <span
          key={`${dx}:${dy}`}
          className="fx-coin"
          style={withVars({ '--dx': `${dx * 1.8}px`, '--dy': `${dy * 1.8 - 40}px` })}
        />
      ))}
    </span>
  )
}
