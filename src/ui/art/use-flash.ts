import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Compteur commun à tous les effets de l'application. Chaque déclenchement reçoit un numéro
 * jamais utilisé : deux effets frères (une gerbe et un texte, par exemple) n'ont jamais la même
 * clé React, même s'ils sont déclenchés ensemble, ni après la fin d'un effet précédent.
 */
let sequence = 0

/**
 * Déclenche un effet visuel passager. « fire » mémorise une valeur (le lieu cliqué, le texte
 * à afficher...) pendant « ms » millisecondes ; le numéro « n », unique dans toute
 * l'application, sert de clé à l'élément animé, pour que l'animation reparte du début.
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
      sequence += 1
      setFlash({ value, n: sequence })
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setFlash(null), ms)
    },
    [ms],
  )

  return [flash, fire] as const
}
