/**
 * Couche de thème : l'apparence de chaque entité du jeu est définie ici, et nulle part ailleurs.
 * Les composants n'affichent jamais un symbole en dur : ils demandent l'apparence
 * d'une entité par son identifiant. Changer de direction artistique, par exemple
 * remplacer les symboles par des images, ne demande de modifier que ce fichier.
 *
 * Direction artistique : un royaume d'héroïc fantasy peuplé de chats. Seule l'apparence
 * change : les identifiants (wood, stone, gold, goblin...) restent ceux du domaine, car ils
 * sont enregistrés dans les événements du journal, qui ne sont jamais modifiés (ADR 0002).
 */
export interface Look {
  /** Symbole affiché. */
  glyph: string
  /** Libellé en français, lu par les lecteurs d'écran et affiché au survol. */
  label: string
}

export const theme: Record<string, Look> = {
  // Lieux du jeu.
  village: { glyph: '🏰', label: 'Village' },
  dungeon: { glyph: '⚔️', label: 'Donjon' },
  ranking: { glyph: '🏆', label: 'Classement' },
  market: { glyph: '🧺', label: 'Marché' },
  tavern: { glyph: '🏮', label: 'Taverne' },
  // Ressources du Village.
  wood: { glyph: '🐟', label: 'poisson' },
  stone: { glyph: '🥛', label: 'lait' },
  gold: { glyph: '🪴', label: 'herbe à chat' },
  // Bâtiments du Village.
  sawmill: { glyph: '🛳️', label: 'bateau de pêche' },
  quarry: { glyph: '🐄', label: 'ferme' },
  mine: { glyph: '🏡', label: 'jardin' },
  // Héros et adversaires du Donjon.
  hero: { glyph: '🐱', label: 'Chat chevalier' },
  companion: { glyph: '🐈', label: 'Chaton écuyer' },
  goblin: { glyph: '🐀', label: 'Rat' },
  skeleton: { glyph: '🦴', label: 'Chien squelette' },
  troll: { glyph: '🌪️', label: "L'Aspirateur" },
  door: { glyph: '🚪', label: 'Porte' },
}

/** Apparence d'une entité ; une apparence neutre si l'entité n'est pas décrite. */
export const look = (kind: string): Look => theme[kind] ?? { glyph: '?', label: kind }
