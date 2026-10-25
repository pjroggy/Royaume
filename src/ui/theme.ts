/**
 * Couche de thème : l'apparence de chaque entité du jeu est définie ici, et nulle part ailleurs.
 * Les composants n'affichent jamais une icône en dur : ils demandent l'apparence
 * d'une entité par son identifiant. Changer de direction artistique ne demande de modifier
 * que ce fichier.
 *
 * Direction artistique : un royaume d'héroïc fantasy peuplé de chats. Seule l'apparence
 * change : les identifiants (wood, stone, gold, goblin...) restent ceux du domaine, car ils
 * sont enregistrés dans les événements du journal, qui ne sont jamais modifiés (ADR 0002).
 *
 * Icônes : collection Game-icons.net (licence CC BY 3.0, crédits dans docs/credits.md),
 * importées une à une depuis react-icons/gi pour que seules celles-ci partent au navigateur.
 */
import type { IconType } from 'react-icons'
import {
  GiAnvilImpact,
  GiBeerStein,
  GiBreastplate,
  GiCape,
  GiCastle,
  GiCat,
  GiChestArmor,
  GiClaws,
  GiCloak,
  GiCow,
  GiCrossedSwords,
  GiDoor,
  GiFishCooked,
  GiFishingBoat,
  GiFlamingClaw,
  GiFlowerPot,
  GiHelp,
  GiHerbsBundle,
  GiHood,
  GiMilkCarton,
  GiPawPrint,
  GiRat,
  GiShop,
  GiSkeleton,
  GiTrophyCup,
  GiVacuumCleaner,
  GiVikingHelmet,
} from 'react-icons/gi'

export interface Look {
  /** Icône affichée ; absente pour les entités présentées par leur seul libellé. */
  icon?: IconType
  /** Teinte de l'icône ; à défaut, la couleur du texte qui l'entoure. */
  color?: string
  /** Libellé en français, lu par les lecteurs d'écran et affiché au survol. */
  label: string
}

export const theme: Record<string, Look> = {
  // Lieux du jeu.
  village: { icon: GiCastle, label: 'Village' },
  dungeon: { icon: GiCrossedSwords, label: 'Donjon' },
  ranking: { icon: GiTrophyCup, label: 'Classement' },
  market: { icon: GiShop, label: 'Marché' },
  tavern: { icon: GiBeerStein, label: 'Taverne' },
  forge: { icon: GiAnvilImpact, label: 'Forge' },
  // Ressources du Village.
  wood: { icon: GiFishCooked, color: '#5fa8d3', label: 'poisson' },
  stone: { icon: GiMilkCarton, color: '#d8d2c4', label: 'lait' },
  gold: { icon: GiHerbsBundle, color: '#6fbf5a', label: 'herbe à chat' },
  // Bâtiments du Village.
  sawmill: { icon: GiFishingBoat, label: 'bateau de pêche' },
  quarry: { icon: GiCow, label: 'ferme' },
  mine: { icon: GiFlowerPot, label: 'jardin' },
  // Héros et adversaires du Donjon.
  hero: { icon: GiCat, label: 'Chat chevalier' },
  companion: { icon: GiPawPrint, label: 'Chaton écuyer' },
  goblin: { icon: GiRat, label: 'Rat' },
  skeleton: { icon: GiSkeleton, label: 'Chien squelette' },
  troll: { icon: GiVacuumCleaner, label: "L'Aspirateur" },
  door: { icon: GiDoor, label: 'Porte' },
  // Recettes de la Forge.
  hornedHelm: { icon: GiVikingHelmet, color: '#b9c0cc', label: 'Heaume cornu' },
  shadowHood: { icon: GiHood, color: '#9b8cc4', label: "Capuche d'ombre" },
  rubyCuirass: { icon: GiBreastplate, color: '#e0566b', label: 'Cuirasse de rubis' },
  sardineMail: { icon: GiChestArmor, color: '#5fa8d3', label: 'Cotte de sardines' },
  emberClaw: { icon: GiFlamingClaw, color: '#ff8a3d', label: 'Lame-griffe ardente' },
  steelClaws: { icon: GiClaws, color: '#b9c0cc', label: "Griffes d'acier" },
  midnightCape: { icon: GiCape, color: '#7c95c9', label: 'Cape de minuit' },
  catnipCape: { icon: GiCloak, color: '#6fbf5a', label: "Cape d'herbe à chat" },
  // Aide.
  help: { icon: GiHelp, label: 'Aide' },
  // Emplacements d'équipement.
  helmet: { icon: GiVikingHelmet, label: 'casque' },
  armor: { icon: GiBreastplate, label: 'armure' },
  weapon: { icon: GiClaws, label: 'arme' },
  cape: { icon: GiCape, label: 'cape' },
  // Qualités des objets forgés : présentées par leur libellé, dans un badge coloré.
  common: { label: 'commun' },
  sturdy: { label: 'solide' },
  rare: { label: 'rare' },
  epic: { label: 'épique' },
  legendary: { label: 'légendaire' },
}

/** Apparence d'une entité ; une apparence neutre si l'entité n'est pas décrite. */
export const look = (kind: string): Look => theme[kind] ?? { icon: GiHelp, label: kind }
