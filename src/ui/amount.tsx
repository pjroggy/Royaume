import { compact, exact } from './format'

/** Quantité de ressources affichée de façon compacte, valeur exacte au survol. */
export function Amount({ value }: { value: number }) {
  return <span title={exact(value)}>{compact(value)}</span>
}
