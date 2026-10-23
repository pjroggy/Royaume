import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import { parsePreference, SCHEME_COOKIE } from '@/ui/color-scheme'
import './art.css'
import './globals.css'

// Métadonnées par défaut de toutes les pages : titre de l'onglet et description.
export const metadata: Metadata = {
  title: 'Royaumes',
  description: 'Jeu multijoueur - monolithe modulaire',
}

/**
 * Mise en page racine, partagée par toutes les pages de l'application.
 * Le type des propriétés est déclaré explicitement plutôt qu'au moyen du type
 * global LayoutProps généré par Next.js : ce dernier n'existe qu'après une
 * première construction, ce qui ferait échouer la vérification des types
 * sur un dépôt fraîchement cloné.
 *
 * Le thème choisi par le joueur (jour ou nuit) est lu dans son cookie et posé sur la balise
 * html dès le rendu sur le serveur ; sans choix, les variables CSS suivent le système.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const preference = parsePreference((await cookies()).get(SCHEME_COOKIE)?.value)
  return (
    <html lang="fr" data-theme={preference === 'system' ? undefined : preference}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
