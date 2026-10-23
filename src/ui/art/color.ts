/** Fonctions de couleur des dessins : pures, sans dépendance, donc testables. */

/** Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur « #rrggbb ». */
export function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const target = amount < 0 ? 0 : 255
  const k = Math.abs(amount)
  const mix = (channel: number) => Math.round(channel + (target - channel) * k)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/** Luminance perçue d'une couleur « #rrggbb », entre 0 (noir) et 1 (blanc). */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

const FURS = ['#d9803a', '#8f8a99', '#2b2633', '#efdcb8', '#b8875a', '#6e5a4a', '#c9c2b8']
const EYES = ['#ffb23f', '#7cf08f', '#9b6bff', '#7cc8ff', '#ff4d5e']
const CAPES = ['#6a1a2a', '#24324a', '#3a1a5a', '#2a4a2a', '#5a3a12']

/** Empreinte stable d'une chaîne (FNV-1a) : un même joueur garde toujours la même allure. */
export function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Allure d'un chat déduite de l'identifiant d'un joueur : pelage, regard et cape. */
export function lookOf(id: string) {
  const h = hash(id)
  const fur = FURS[h % FURS.length]
  return {
    fur,
    belly: luminance(fur) < 0.3 ? '#4a4352' : shade(fur, 0.6),
    eyes: EYES[(h >>> 4) % EYES.length],
    capeColor: CAPES[(h >>> 8) % CAPES.length],
  }
}
