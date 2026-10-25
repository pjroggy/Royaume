import { look } from './theme'

/**
 * Affiche une entité du jeu (ressource, bâtiment...) à partir du thème.
 * L'icône est masquée aux lecteurs d'écran, qui lisent le libellé à la place.
 */
export function Entity({ kind, showLabel = false }: { kind: string; showLabel?: boolean }) {
  const { icon: Icon, color, label } = look(kind)
  return (
    <span className="entity" title={label}>
      {Icon && <Icon className="icon" aria-hidden="true" focusable="false" style={{ color }} />}
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  )
}
