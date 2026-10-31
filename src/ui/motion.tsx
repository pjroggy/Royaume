'use client'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useAnimate,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { type ReactNode, useEffect, useRef } from 'react'
import { at } from './art/scene'

/*
 * Animations de l'interface, fondées sur Motion (ADR 0015). Ce fichier rassemble les briques
 * réutilisables ; les écrans des modules les composent, sans dépendre directement des détails
 * de la bibliothèque. Comme les décors, ces composants n'ont aucune logique de jeu.
 *
 * Les animations suivent des ressorts plutôt que des durées fixes : une animation interrompue
 * repart de sa position et de sa vitesse du moment, au lieu de sauter.
 */

/** Ressort des panneaux et des éléments qui apparaissent : vif, sans rebond excessif. */
export const SOFT_SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const

/** Ressort des boutons et des objets qui « sautent » : plus nerveux, avec un léger rebond. */
export const BOUNCY_SPRING = { type: 'spring', stiffness: 420, damping: 18 } as const

/**
 * Racine des animations d'un écran. Elle respecte la préférence du joueur : avec « réduire
 * les animations » activé dans le système, les déplacements et les changements d'échelle
 * sont supprimés, et seules les variations d'opacité sont conservées.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/** Bloc qui apparaît en glissant légèrement vers le haut. */
export function Appear({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ ...SOFT_SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Contenu qui change d'état (en attente, en fabrication, prêt...) : l'ancien contenu s'efface
 * avant que le nouveau n'apparaisse. stateKey identifie l'état affiché.
 */
export function Swap({ stateKey, children }: { stateKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Appear key={stateKey}>{children}</Appear>
    </AnimatePresence>
  )
}

/** Nombre qui défile jusqu'à sa nouvelle valeur, au lieu de changer d'un coup. */
export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 })
  const shown = useTransform(spring, (v) => Math.round(v))
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  return <motion.span>{shown}</motion.span>
}

/** Jauge de progression : la largeur glisse d'une seconde à l'autre, sans saccade. */
export function Gauge({ ratio }: { ratio: number }) {
  const width = `${Math.min(100, Math.max(0, ratio * 100))}%`
  return (
    <div className="gauge">
      <motion.div
        initial={false}
        animate={{ width }}
        transition={{ duration: 1, ease: 'linear' }}
      />
    </div>
  )
}

/**
 * Étincelles d'une gerbe : angle et portée de chacune, en degrés et en pixels. Valeurs fixes,
 * pour que l'effet soit identique d'une fois à l'autre et entre le serveur et le navigateur.
 */
const SPARKS = [
  [-150, 70],
  [-120, 95],
  [-100, 60],
  [-80, 105],
  [-60, 75],
  [-35, 90],
  [-20, 55],
  [-135, 50],
  [-45, 110],
  [-90, 85],
  [-160, 45],
  [-10, 70],
]

/**
 * Gerbe d'étincelles : chaque étincelle part du point d'impact, monte, puis retombe sous
 * l'effet d'une gravité simulée, en rapetissant et en refroidissant. Un anneau de chaleur
 * s'étend au centre.
 */
export function SparkBurst({ left, top }: { left: string; top: string }) {
  // Animations réduites : seul l'anneau, qui ne fait que s'estomper, est conservé.
  const reduce = useReducedMotion()
  return (
    <span className="mfx" style={at(left, top)} aria-hidden="true">
      <motion.span
        className="mfx-ring"
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {!reduce &&
        SPARKS.map(([angle, reach], i) => {
          const rad = (angle * Math.PI) / 180
          const dx = Math.cos(rad) * reach
          const dy = Math.sin(rad) * reach
          return (
            <motion.span
              key={`${angle}:${reach}`}
              className="mfx-spark"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: [0, dx * 0.7, dx],
                // La trajectoire monte, puis retombe plus bas que son point le plus haut.
                y: [0, dy, dy + 70],
                opacity: [1, 1, 0],
                scale: [1, 0.8, 0.3],
              }}
              transition={{ duration: 0.9 + (i % 3) * 0.12, times: [0, 0.45, 1], ease: 'easeOut' }}
            />
          )
        })}
    </span>
  )
}

/** Texte qui jaillit puis s'envole : niveau atteint, objet retiré... */
export function FloatUp({ left, top, text }: { left: string; top: string; text: string }) {
  return (
    <motion.span
      className="mfx-float"
      style={{ ...at(left, top), x: '-50%' }}
      aria-hidden="true"
      initial={{ opacity: 0, y: 10, scale: 0.6 }}
      animate={{ opacity: [0, 1, 1, 0], y: [10, -10, -40, -70], scale: [0.6, 1.15, 1, 1] }}
      transition={{ duration: 1.6, times: [0, 0.2, 0.7, 1], ease: 'easeOut' }}
    >
      {text}
    </motion.span>
  )
}

/**
 * Personnage qui fait un petit bond à chaque changement de bumpKey : un objet équipé, une
 * allure modifiée. Au premier affichage, il ne bouge pas.
 */
export function Hop({ bumpKey, children }: { bumpKey: string; children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const reduce = useReducedMotion()
  const last = useRef(bumpKey)
  useEffect(() => {
    if (last.current === bumpKey) return
    last.current = bumpKey
    if (reduce) return
    animate(
      scope.current,
      { y: [0, -14, 0], scaleY: [1, 1.06, 1], scaleX: [1, 0.96, 1] },
      { duration: 0.45, ease: 'easeOut' },
    )
  }, [bumpKey, reduce, animate, scope])
  return (
    <span ref={scope} style={{ display: 'inline-block', transformOrigin: '50% 100%' }}>
      {children}
    </span>
  )
}

export { AnimatePresence, motion }
