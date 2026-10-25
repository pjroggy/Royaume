'use client'
import { useEffect, useState } from 'react'
import type { IconType } from 'react-icons'
import { GiEclipse, GiMoon, GiSunset } from 'react-icons/gi'
import {
  nextPreference,
  parsePreference,
  SCHEME_COOKIE,
  type SchemePreference,
} from './color-scheme'

/** Apparence du bouton pour chaque préférence. */
const LABELS: Record<SchemePreference, { icon: IconType; label: string }> = {
  system: { icon: GiEclipse, label: 'Thème du système' },
  light: { icon: GiSunset, label: 'Crépuscule' },
  dark: { icon: GiMoon, label: 'Nuit' },
}

/** Durée de conservation du cookie de préférence : un an. */
const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Bouton qui fait passer l'affichage du thème du système au jour, puis à la nuit.
 * Il modifie l'attribut data-theme de la page, que lisent les variables CSS de globals.css,
 * et enregistre le choix dans un cookie pour les visites suivantes.
 */
export function ThemeToggle() {
  // La préférence n'est connue qu'une fois la page chargée dans le navigateur :
  // le premier rendu, identique sur le serveur et dans le navigateur, n'en dépend pas.
  const [preference, setPreference] = useState<SchemePreference | null>(null)

  useEffect(() => {
    setPreference(parsePreference(document.documentElement.dataset.theme))
  }, [])

  function toggle() {
    const next = nextPreference(preference ?? 'system')
    const root = document.documentElement
    if (next === 'system') root.removeAttribute('data-theme')
    else root.dataset.theme = next
    // Le cookie est écrit par la page, car c'est une simple préférence d'affichage, lue par
    // la mise en page racine au rendu suivant ; il ne contient aucune donnée de session.
    const cookie =
      next === 'system'
        ? `${SCHEME_COOKIE}=; path=/; max-age=0; samesite=lax`
        : `${SCHEME_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    // biome-ignore lint/suspicious/noDocumentCookie: préférence d'affichage, sans donnée sensible
    document.cookie = cookie
    setPreference(next)
  }

  const { icon: Icon, label } = LABELS[preference ?? 'system']
  return (
    <button
      className="link theme-toggle"
      type="button"
      onClick={toggle}
      title={`${label} : cliquer pour changer`}
    >
      <Icon className="icon" aria-hidden="true" focusable="false" /> {label}
    </button>
  )
}
