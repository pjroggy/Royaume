/**
 * Préférence d'affichage du joueur : thème clair (le jour au royaume), thème sombre (la nuit),
 * ou thème du système. Elle est conservée dans un cookie, lu par la mise en page racine, qui
 * pose l'attribut data-theme dès le rendu sur le serveur : la page s'affiche directement
 * dans le bon thème. Ce n'est pas une donnée de jeu : aucun module ne la connaît.
 */
export type ColorScheme = 'light' | 'dark'

/** Préférence enregistrée ; « system » signifie qu'aucun cookie n'est posé. */
export type SchemePreference = ColorScheme | 'system'

/** Nom du cookie qui conserve la préférence. */
export const SCHEME_COOKIE = 'royaumes-theme'

/** Préférence lue dans la valeur du cookie ; toute valeur inattendue vaut « system ». */
export const parsePreference = (value: string | undefined): SchemePreference =>
  value === 'light' || value === 'dark' ? value : 'system'

/** Préférence suivante, dans l'ordre du bouton : système, jour, nuit. */
export const nextPreference = (current: SchemePreference): SchemePreference =>
  current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'
