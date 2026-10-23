import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Déclenche un effet visuel passager. « fire » mémorise une valeur (le lieu cliqué, le texte
 * à afficher...) pendant « ms » millisecondes ; le compteur « n » change à chaque appel, et
 * sert de clé à l'élément animé, pour que l'animation reparte du début.
 */
export function useFlash<T>(ms: number) {
  const [flash, setFlash] = useState<{ value: T; n: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Le minuteur est annulé si l'écran disparaît avant la fin de l'effet.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const fire = useCallback(
    (value: T) => {
      setFlash((previous) => ({ value, n: (previous?.n ?? 0) + 1 }))
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setFlash(null), ms)
    },
    [ms],
  )

  return [flash, fire] as const
}
