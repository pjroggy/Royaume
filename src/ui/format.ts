/**
 * Quantité affichée de façon compacte : « 950 », « 12,3k », « 4,5M ». La valeur est tronquée
 * et non arrondie : le joueur ne voit jamais plus de ressources qu'il n'en possède.
 * La valeur exacte reste disponible au survol (attribut title, voir Amount).
 */
export function compact(value: number): string {
  const n = Math.max(0, Math.floor(value))
  if (n < 1000) return String(n)
  const [divisor, unit] = n < 1_000_000 ? [1000, 'k'] : [1_000_000, 'M']
  const scaled = n / divisor
  // Une décimale sous 100 (« 12,3k »), aucune au-delà (« 245k »).
  const digits = scaled < 100 ? 1 : 0
  const truncated = Math.floor(scaled * 10 ** digits) / 10 ** digits
  return `${truncated.toFixed(digits).replace('.', ',').replace(/,0$/, '')}${unit}`
}

/** Valeur exacte, avec séparateur des milliers, pour l'infobulle : « 12 345 ». */
export const exact = (value: number) =>
  Math.floor(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
