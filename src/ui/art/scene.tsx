import type { CSSProperties, ReactNode } from 'react'

/**
 * Mise en scène commune aux écrans du jeu : un décor dessiné, des éléments posés dessus
 * (personnages, lieux cliquables), et un panneau superposé à droite qui porte le contenu
 * de l'écran. Sur un écran étroit, le panneau passe sous le décor.
 *
 * Le composant ne contient aucune logique : chaque module garde ses requêtes, ses commandes
 * et son temps réel, et ne lui confie que l'affichage.
 */
export function Scene({
  label,
  art,
  backdrop,
  children,
  overlay,
}: {
  /** Nom du décor, lu par les lecteurs d'écran. */
  label: string
  /** Classe du décor (art-map, art-dun...), qui porte ses couleurs et ses animations. */
  art: string
  backdrop: ReactNode
  /** Éléments posés sur le décor, positionnés en pourcentage. */
  children?: ReactNode
  /** Contenu du panneau superposé. */
  overlay?: ReactNode
}) {
  return (
    <div className="scene-wrap">
      <section className={`scene ${art}`} aria-label={label}>
        {backdrop}
        <div className="scene-layer">{children}</div>
      </section>
      {overlay && <div className="scene-overlay">{overlay}</div>}
    </div>
  )
}

/** Position d'un élément posé sur le décor, en pourcentage de sa largeur et de sa hauteur. */
export const at = (left: string, top: string, extra: CSSProperties = {}): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  ...extra,
})

/** Style portant des propriétés personnalisées (--dx...), que le type CSSProperties ignore. */
export const withVars = (vars: Record<string, string>): CSSProperties => vars as CSSProperties
