'use client'
import { hc } from 'hono/client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useChannel } from '@/platform/realtime/use-channel'
import { CatAvatar, type CatAvatarProps } from '@/ui/art/cat-avatar'
import { bellyFor, lookOf } from '@/ui/art/color'
import { Burst } from '@/ui/art/effects'
import { ForgeBackdrop, HotMetal } from '@/ui/art/forge-room'
import { HallBackdrop } from '@/ui/art/hall-of-heroes'
import { at, Scene } from '@/ui/art/scene'
import { useFlash } from '@/ui/art/use-flash'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Entity } from '@/ui/entity'
import {
  AnimatedNumber,
  AnimatePresence,
  BOUNCY_SPRING,
  FloatUp,
  Gauge,
  Hop,
  MotionRoot,
  motion,
  SOFT_SPRING,
  SparkBurst,
  Swap,
} from '@/ui/motion'
import { look } from '@/ui/theme'
import { useCountdown } from '@/ui/use-countdown'
import type { ForgeApi } from './api'
import {
  type Amounts,
  CAT_KINDS,
  type CatLook,
  ENGRAVING_MAX,
  EYE_COLORS,
  type ForgeError,
  type ForgeView,
  FUR_COLORS,
  forgeChannel,
  type ItemView,
  isEyeColor,
  isFurColor,
  type PublicCat,
  SLOTS,
  type Slot,
} from './contracts'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
const client = hc<ForgeApi>('/api/forge')

/** Erreurs que l'API peut renvoyer : erreurs métier et erreur de validation. */
type ApiError = { code: ForgeError['code'] | 'INVALID_INPUT'; message?: string }

/** Message affiché au joueur pour chaque erreur. */
const ERRORS: Record<ApiError['code'], string> = {
  INVALID_INPUT: 'Saisie invalide.',
  UNKNOWN_RECIPE: 'Recette inconnue.',
  FORGE_BUSY: "La forge est occupée : retirez d'abord l'objet en cours.",
  INVENTORY_FULL: 'Votre inventaire est plein.',
  MAX_LEVEL_REACHED: 'La forge est déjà au niveau maximal.',
  NOTHING_TO_COLLECT: "Aucun objet n'attend sur l'enclume.",
  NOT_READY: "L'objet n'est pas encore prêt.",
  NOT_CANCELLABLE: 'Cette commande ne peut plus être annulée.',
  NOT_IN_INVENTORY: "Cet objet n'est pas dans votre inventaire.",
  INVALID_ENGRAVING: `La gravure compte de 1 à ${ENGRAVING_MAX} caractères.`,
  INVALID_LOOK: "Cette allure n'est pas proposée par le jeu.",
  ITEM_EQUIPPED: "Ôtez d'abord cet objet : un objet porté ne peut pas être fondu.",
}

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

/** Couleur de cape de chaque recette de cape, pour le chat équipé. */
const CAPE_COLORS: Record<string, string> = { midnightCape: '#24324a', catnipCape: '#2f6a2a' }

// ---------------------------------------------------------------------------
// Le chat d'un joueur, tel que les autres modules l'affichent
// ---------------------------------------------------------------------------

/**
 * Chats des joueurs donnés (allure et équipement porté), lus auprès de la Forge.
 * La Taverne et le Donjon l'utilisent par composition d'interface : leur code serveur ignore
 * tout de la Forge, et un chat absent de la réponse garde simplement l'allure par défaut.
 */
export function useCats(playerIds: string[]): Record<string, PublicCat> {
  const [cats, setCats] = useState<Record<string, PublicCat>>({})
  // Clé stable : l'effet ne relit que si l'ensemble des joueurs change.
  const key = [...new Set(playerIds)].sort().join(',')
  useEffect(() => {
    if (!key) return
    let current = true
    client.cats.$get({ query: { ids: key } }).then(async (res) => {
      if (res.ok && current) setCats((await res.json()).cats)
    })
    return () => {
      current = false
    }
  }, [key])
  return cats
}

/** Allure par défaut d'un joueur qui n'a rien choisi : déduite de son identifiant. */
function defaultLook(playerId: string): CatLook {
  const { fur, eyes } = lookOf(playerId)
  return {
    kind: 'cat',
    fur: isFurColor(fur) ? fur : FUR_COLORS[0],
    eyes: isEyeColor(eyes) ? eyes : EYE_COLORS[0],
  }
}

/** Chat public tiré de la vue de la forge du joueur, avec éventuellement une autre allure. */
function catOfView(view: ForgeView, look: CatLook | null = view.look): PublicCat {
  return {
    look,
    gear: Object.fromEntries(
      SLOTS.map((slot) => {
        const item = view.equipped[slot]
        return [slot, item ? { recipe: item.recipe, quality: item.quality } : null]
      }),
    ) as PublicCat['gear'],
  }
}

/** Propriétés de dessin d'un chat : allure choisie (ou par défaut) et équipement porté. */
function catProps(playerId: string, cat: PublicCat | undefined) {
  const look = cat?.look ?? defaultLook(playerId)
  const gear = cat?.gear
  return {
    kitten: look.kind === 'kitten',
    fur: look.fur,
    belly: bellyFor(look.fur),
    eyes: look.eyes,
    helmet: !!gear?.helmet,
    armor: !!gear?.armor,
    weapon: !!gear?.weapon,
    cape: !!gear?.cape,
    capeColor: CAPE_COLORS[gear?.cape?.recipe ?? ''] ?? '#6a1a2a',
  }
}
// DETTE TECHNIQUE DT-018 (docs/qualite/dette-technique.md) : tant que le chat n'est pas lu,
// le chat par défaut est affiché, puis remplacé par celui du joueur.
/** Le chat d'un joueur, avec son allure et son équipement, partout dans le jeu. */
export function PlayerCat({
  playerId,
  cat,
  ...rest
}: { playerId: string; cat: PublicCat | undefined } & Omit<
  CatAvatarProps,
  keyof ReturnType<typeof catProps>
>) {
  return <CatAvatar {...catProps(playerId, cat)} {...rest} />
}

/** Affiche des quantités de ressources : « 60 [poisson] 40 [lait] », chacune avec son icône. */
function Cost({ amounts }: { amounts: Amounts }) {
  return (
    <>
      {Object.entries(amounts).map(([resource, amount]) => (
        <span key={resource}>
          {amount} <Entity kind={resource} />{' '}
        </span>
      ))}
    </>
  )
}

/** Durée en minutes et secondes : « 2 min », « 1 min 30 s ». */
function duration(ms: number) {
  const seconds = Math.round(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return [minutes > 0 ? `${minutes} min` : '', rest > 0 ? `${rest} s` : ''].join(' ').trim()
}

/** Bonus d'un objet : « +4 attaque, +2 défense ». */
function bonusText({ attack, defense }: { attack: number; defense: number }) {
  return [attack > 0 ? `+${attack} attaque` : '', defense > 0 ? `+${defense} défense` : '']
    .filter(Boolean)
    .join(', ')
}

/** Écran de la Forge : niveau, recettes, fabrication en cours, inventaire et équipement. */
export function ForgeScreen({ userId }: { userId: string }) {
  // undefined : chargement en cours.
  const [view, setView] = useState<ForgeView | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  // Effets visuels : gerbe sur l'enclume, texte qui s'envole.
  const [burst, fireBurst] = useFlash<true>(900)
  const [gain, fireGain] = useFlash<string>(1600)
  // Objet qui vient d'être retiré : son icône vole de l'enclume jusqu'à l'inventaire.
  const [flight, fireFlight] = useFlash<string>(1200)

  // REQUÊTE : lecture de la forge, qui fait aussi reprendre une saga interrompue.
  const refresh = useCallback(async () => {
    const res = await client.index.$get()
    if (res.ok) setView((await res.json()).view)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // TEMPS RÉEL : chaque événement de la forge du joueur, y compris une réponse du Village
  // traitée plus tard ou une commande passée depuis un autre onglet, provoque une relecture.
  const status = useChannel(forgeChannel(userId), refresh)

  // ÉCHÉANCE : la fin de la fabrication est constatée à la lecture. Le compte à rebours relit
  // la forge à l'échéance ; la vue présente alors l'objet comme prêt, et l'échéance disparaît.
  // Le même compte à rebours sert au délai de réponse du Village, pour un travail en attente
  // de paiement (règle 13) : à son terme, la forge est relue et propose l'abandon.
  const job = view?.current
  let deadline: number | null = null
  if (job?.status === 'forging') deadline = job.readyAt
  else if (job?.status === 'paying' && !job.abandonable) deadline = job.paymentDueAt
  const remaining = useCountdown(deadline, refresh)

  /** Applique la réponse d'une commande ; vrai si elle a réussi. */
  async function handle(res: Response) {
    const body = (await res.json()) as { view: ForgeView } | { error: ApiError }
    if ('error' in body) {
      setError(ERRORS[body.error.code] ?? 'Erreur.')
      return null
    }
    setError(null)
    setView(body.view)
    return body.view
  }

  // COMMANDES : chaque réponse contient la vue à jour, ou une erreur.
  async function order(recipe: string) {
    const next = await handle(await client.orders.$post({ json: { recipe } }))
    if (next?.current?.status === 'forging') fireBurst(true)
  }
  async function upgrade() {
    const next = await handle(await client.upgrade.$post())
    if (next && view && next.level > view.level) {
      fireBurst(true)
      fireGain(`Forge niveau ${next.level} !`)
    }
  }
  async function collect() {
    const next = await handle(await client.collect.$post())
    const item = next?.inventory.at(-1)
    if (item) {
      fireFlight(item.itemId)
      fireBurst(true)
      fireGain(`${look(item.recipe).label} ${look(item.quality).label} !`)
    }
  }
  const cancel = async () => handle(await client.orders.cancel.$post())
  const equip = async (itemId: string) => handle(await client.equip.$post({ json: { itemId } }))
  const unequip = async (slot: Slot) => handle(await client.unequip.$post({ json: { slot } }))
  const melt = async (itemId: string) => handle(await client.melt.$post({ json: { itemId } }))
  const engrave = async (itemId: string, text: string) =>
    handle(await client.engrave.$post({ json: { itemId, text } }))

  const title = (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1>
        <Entity kind="forge" /> Forge
        {view && (
          <span className="muted">
            {' '}
            - niveau <AnimatedNumber value={view.level} /> / {view.maxLevel}, qualité{' '}
            {look(view.quality).label}
          </span>
        )}
      </h1>
      <span className="status" data-status={status}>
        {STATUS_LABELS[status]}
      </span>
    </div>
  )

  // Chargement en cours.
  if (!view) return title

  const current = view.current
  const busy = current !== null
  // Le chat fait un petit bond chaque fois que son équipement change.
  const outfit = SLOTS.map((slot) => view.equipped[slot]?.itemId ?? '-').join('|')

  return (
    <MotionRoot>
      {title}
      <Scene
        label="Atelier de la forge"
        art="art-forge"
        backdrop={<ForgeBackdrop heat={(view.level - 1) / (view.maxLevel - 1)} />}
        overlay={
          <>
            <WorkPanel
              view={view}
              remaining={remaining}
              onUpgrade={upgrade}
              onCancel={cancel}
              onCollect={collect}
            />
            <RecipesPanel view={view} busy={busy} onOrder={order} />
            {error && (
              <p className="error panel" role="alert">
                {error}
              </p>
            )}
          </>
        }
      >
        {/* Le chat du joueur, qui porte l'équipement de son inventaire. */}
        <span style={at('6%', '30%')}>
          <Hop bumpKey={outfit}>
            <PlayerCat
              playerId={userId}
              cat={catOfView(view)}
              size={190}
              label="Votre chat et son équipement"
            />
          </Hop>
        </span>

        {/* L'enclume : un objet chauffé à blanc pendant la fabrication, prêt ensuite. */}
        {current?.kind === 'item' && current.status !== 'paying' && (
          <motion.span
            key={current.status}
            className="anvil-item"
            style={at('42%', '58%', { width: '12%' })}
            initial={{ scale: 0.3, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={BOUNCY_SPRING}
          >
            {current.status === 'forging' ? (
              <HotMetal />
            ) : (
              <button type="button" className="ready-item" onClick={collect}>
                <motion.span layoutId="anvil-item" className="anvil-flight">
                  <Entity kind={current.recipe ?? 'forge'} />
                </motion.span>{' '}
                Retirer
              </button>
            )}
          </motion.span>
        )}

        {burst && <SparkBurst key={burst.n} left="48%" top="68%" />}
        {gain && <FloatUp key={gain.n} left="48%" top="58%" text={gain.value} />}
      </Scene>

      <Inventory
        view={view}
        flight={flight?.value ?? null}
        onEquip={equip}
        onUnequip={unequip}
        onEngrave={engrave}
        onMelt={melt}
      />
    </MotionRoot>
  )
}

/** Travail en cours : paiement, fabrication, objet prêt ; ou amélioration de la forge. */
function WorkPanel({
  view,
  remaining,
  onUpgrade,
  onCancel,
  onCollect,
}: {
  view: ForgeView
  remaining: number | null
  onUpgrade: () => void
  onCancel: () => void
  onCollect: () => void
}) {
  // Chaque état du travail a sa clé : le panneau change d'état en fondu, au lieu de sauter.
  const current = view.current
  const state = current ? `${current.kind}-${current.status}` : 'idle'
  return (
    <Swap stateKey={state}>
      <WorkContent
        view={view}
        remaining={remaining}
        onUpgrade={onUpgrade}
        onCancel={onCancel}
        onCollect={onCollect}
      />
    </Swap>
  )
}

/** Contenu du panneau du travail en cours, pour l'état présent. */
function WorkContent({
  view,
  remaining,
  onUpgrade,
  onCancel,
  onCollect,
}: {
  view: ForgeView
  remaining: number | null
  onUpgrade: () => void
  onCancel: () => void
  onCollect: () => void
}) {
  const current = view.current
  if (current?.status === 'paying') {
    return (
      <div className="panel">
        <p className="kicker">Sur l'enclume</p>
        <p>Le Village prépare le paiement...</p>
        {current.abandonable ? (
          <>
            <p className="muted">
              Le Village ne répond pas. Vous pouvez abandonner la commande : si le paiement est
              confirmé plus tard, il vous sera remboursé.
            </p>
            <button type="button" className="wide secondary" onClick={onCancel}>
              Abandonner la commande
            </button>
          </>
        ) : (
          remaining !== null && (
            <p className="muted">
              Sans réponse dans {duration(remaining * 1000)}, vous pourrez abandonner la commande.
            </p>
          )
        )}
      </div>
    )
  }
  if (current?.kind === 'item') {
    const total = view.recipes.find((r) => r.recipe === current.recipe)?.durationMs ?? 1
    const left = (remaining ?? 0) * 1000
    return (
      <div className="panel">
        <p className="kicker">Sur l'enclume</p>
        <h2>
          <Entity kind={current.recipe ?? 'forge'} showLabel />{' '}
          <span className="quality" data-quality={current.quality}>
            {look(current.quality ?? '').label}
          </span>
        </h2>
        {current.status === 'forging' ? (
          <>
            <Gauge ratio={1 - left / total} />
            <div className="line">
              <span>Prêt dans</span>
              <strong>{duration(left)}</strong>
            </div>
            <button type="button" className="wide secondary" onClick={onCancel}>
              Annuler et être remboursé
            </button>
          </>
        ) : (
          <button type="button" className="wide" onClick={onCollect}>
            Retirer l'objet
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="panel">
      <p className="kicker">La forge</p>
      <div className="line">
        <span>Niveau</span>
        <strong>
          {view.level} / {view.maxLevel}
        </strong>
      </div>
      <Gauge ratio={view.level / view.maxLevel} />
      <div className="line">
        <span>Qualité des objets</span>
        <strong className="quality" data-quality={view.quality}>
          {look(view.quality).label}
        </strong>
      </div>
      {view.refusal && (
        <p className="error">
          Paiement refusé : il manque <Cost amounts={view.refusal.missing} />
        </p>
      )}
      {view.upgradeCost ? (
        <button type="button" className="wide" onClick={onUpgrade}>
          Améliorer : <Cost amounts={view.upgradeCost} />
        </button>
      ) : (
        <p className="muted">Niveau maximal atteint.</p>
      )}
    </div>
  )
}

/** Recettes du catalogue, avec leur coût, leur durée et le bonus à la qualité actuelle. */
function RecipesPanel({
  view,
  busy,
  onOrder,
}: {
  view: ForgeView
  busy: boolean
  onOrder: (recipe: string) => void
}) {
  return (
    <div className="panel">
      <h2>Recettes</h2>
      <ul className="recipes">
        {view.recipes.map((recipe, i) => (
          <motion.li
            key={recipe.recipe}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SOFT_SPRING, delay: i * 0.04 }}
          >
            <span>
              <Entity kind={recipe.recipe} showLabel />
              <small className="muted">
                {' '}
                {look(recipe.slot).label}, {duration(recipe.durationMs)}, {bonusText(recipe.bonus)}
              </small>
              <br />
              <Cost amounts={recipe.cost} />
            </span>
            <motion.button
              type="button"
              disabled={busy}
              onClick={() => onOrder(recipe.recipe)}
              whileHover={busy ? undefined : { scale: 1.06 }}
              whileTap={busy ? undefined : { scale: 0.92 }}
              transition={BOUNCY_SPRING}
            >
              Forger
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/** Choix de l'allure : silhouette, pelage et couleur des yeux, parmi ceux proposés. */
function LookPanel({
  look: current,
  onChange,
}: {
  look: CatLook
  onChange: (look: CatLook) => void
}) {
  return (
    <div className="look">
      <div className="row">
        <span className="muted">Silhouette</span>
        {CAT_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className={current.kind === kind ? undefined : 'secondary'}
            aria-pressed={current.kind === kind}
            onClick={() => onChange({ ...current, kind })}
          >
            {kind === 'cat' ? 'Chat chevalier' : 'Chaton écuyer'}
          </button>
        ))}
      </div>
      <div className="row">
        <span className="muted">Pelage</span>
        {FUR_COLORS.map((fur) => (
          <button
            key={fur}
            type="button"
            className="swatch"
            aria-label={`Pelage ${fur}`}
            aria-pressed={current.fur === fur}
            style={{ background: fur }}
            onClick={() => onChange({ ...current, fur })}
          />
        ))}
      </div>
      <div className="row">
        <span className="muted">Regard</span>
        {EYE_COLORS.map((eyes) => (
          <button
            key={eyes}
            type="button"
            className="swatch"
            aria-label={`Yeux ${eyes}`}
            aria-pressed={current.eyes === eyes}
            style={{ background: eyes }}
            onClick={() => onChange({ ...current, eyes })}
          />
        ))}
      </div>
    </div>
  )
}

/** Inventaire : objets forgés, équipement porté et gravures. */
function Inventory({
  view,
  flight,
  onEquip,
  onUnequip,
  onEngrave,
  onMelt,
}: {
  view: ForgeView
  /** Objet qui vient d'être retiré de l'enclume : son icône y arrive en vol. */
  flight: string | null
  onEquip: (itemId: string) => void
  onUnequip: (slot: Slot) => void
  onEngrave: (itemId: string, text: string) => void
  onMelt: (itemId: string) => void
}) {
  // Objet dont la fonte attend la confirmation du joueur (règle 14).
  const [melting, setMelting] = useState<ItemView | null>(null)
  return (
    <section className="panel" aria-label="Inventaire">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Inventaire</h2>
        <span className="muted">
          {view.inventory.length} objet(s) - équipement : {bonusText(view.bonuses) || 'aucun bonus'}{' '}
          - <Link href="/avatar">changer l'allure de mon chat</Link>
        </span>
      </div>
      <div className="slots">
        {SLOTS.map((slot) => {
          const worn = view.equipped[slot]
          return (
            <span key={slot} className="slot" data-filled={worn !== null}>
              <small className="muted">{look(slot).label}</small>
              <br />
              {/* La clé change avec l'objet porté : le nouveau contenu apparaît d'un rebond. */}
              <motion.span
                key={worn?.itemId ?? 'vide'}
                style={{ display: 'inline-block' }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={BOUNCY_SPRING}
              >
                {worn ? (
                  <Entity kind={worn.recipe} showLabel />
                ) : (
                  <span className="muted">vide</span>
                )}
              </motion.span>
            </span>
          )
        })}
      </div>
      {view.inventory.length === 0 && (
        <p className="muted">Aucun objet pour le moment : forgez-en un !</p>
      )}
      <ul className="items">
        {/* Un objet fondu sort de la liste en rougeoyant ; les suivants remontent. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {view.inventory.map((item) => (
            <ItemRow
              key={item.itemId}
              item={item}
              flying={item.itemId === flight}
              onEquip={onEquip}
              onUnequip={onUnequip}
              onEngrave={onEngrave}
              onMelt={() => setMelting(item)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <ConfirmDialog
        open={melting !== null}
        title="Fondre cet objet ?"
        confirmLabel="Fondre définitivement"
        onCancel={() => setMelting(null)}
        onConfirm={() => {
          if (melting) onMelt(melting.itemId)
          setMelting(null)
        }}
      >
        {melting && (
          <>
            <p>
              <Entity kind={melting.recipe} showLabel />{' '}
              <span className="quality" data-quality={melting.quality}>
                {look(melting.quality).label}
              </span>
              {melting.engraving && <em className="engraving"> « {melting.engraving} »</em>}
            </p>
            <p>
              L'objet sera <strong>détruit définitivement</strong>, sans aucune ressource rendue
              {melting.engraving ? ', et sa gravure disparaîtra avec lui' : ''}.
            </p>
            {(melting.quality === 'epic' || melting.quality === 'legendary') && (
              <p className="error">
                Attention : c'est un objet {look(melting.quality).label}, parmi les plus rares de la
                forge.
              </p>
            )}
          </>
        )}
      </ConfirmDialog>
    </section>
  )
}

/** Un objet de l'inventaire, avec ses actions. */
function ItemRow({
  item,
  flying,
  onEquip,
  onUnequip,
  onEngrave,
  onMelt,
}: {
  item: ItemView
  flying: boolean
  onEquip: (itemId: string) => void
  onUnequip: (slot: Slot) => void
  onEngrave: (itemId: string, text: string) => void
  /** Demande la fonte de l'objet ; la confirmation est demandée par l'inventaire. */
  onMelt: () => void
}) {
  const [text, setText] = useState(item.engraving ?? '')
  return (
    <motion.li
      layout
      data-equipped={item.equipped || undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, backgroundColor: 'rgba(255, 90, 40, 0.35)' }}
      transition={SOFT_SPRING}
    >
      <span>
        {/* Même identifiant de mise en page que l'objet de l'enclume : l'icône y vole. */}
        <motion.span layoutId={flying ? 'anvil-item' : undefined} className="anvil-flight">
          <Entity kind={item.recipe} showLabel />
        </motion.span>{' '}
        <span className="quality" data-quality={item.quality}>
          {look(item.quality).label}
        </span>
        <small className="muted"> {bonusText(item.bonus)}</small>
        {item.engraving && <em className="engraving"> « {item.engraving} »</em>}
      </span>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          onEngrave(item.itemId, text)
        }}
      >
        <input
          aria-label={`Gravure : ${look(item.recipe).label}`}
          value={text}
          maxLength={ENGRAVING_MAX}
          placeholder="Graver un nom"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="secondary">
          Graver
        </button>
        {item.equipped ? (
          <button type="button" className="secondary" onClick={() => onUnequip(item.slot)}>
            Ôter
          </button>
        ) : (
          <button type="button" onClick={() => onEquip(item.itemId)}>
            Équiper
          </button>
        )}
        <button
          type="button"
          className="secondary danger"
          disabled={item.equipped}
          title={item.equipped ? "Ôtez l'objet avant de le fondre" : undefined}
          onClick={onMelt}
        >
          Fondre
        </button>
      </form>
    </motion.li>
  )
}

/**
 * Page « Mon chat », ouverte depuis le château du Village : le joueur compose l'allure de son
 * chat et voit l'équipement qu'il porte. Équiper et ôter les objets se fait à la Forge.
 */
export function AvatarScreen({ userId }: { userId: string }) {
  const [view, setView] = useState<ForgeView | undefined>(undefined)
  // Allure en cours de composition, tant qu'elle n'est pas enregistrée.
  const [draft, setDraft] = useState<CatLook | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [burst, fireBurst] = useFlash<true>(900)

  const refresh = useCallback(async () => {
    const res = await client.index.$get()
    if (res.ok) setView((await res.json()).view)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const title = (
    <h1>
      <Entity kind="village" /> Mon chat
    </h1>
  )
  if (!view) return title

  const saved = view.look ?? defaultLook(userId)
  const shown = draft ?? saved
  const changed = shown.kind !== saved.kind || shown.fur !== saved.fur || shown.eyes !== saved.eyes

  async function save() {
    const res = await client.look.$post({ json: shown })
    const body = (await res.json()) as { view: ForgeView } | { error: ApiError }
    if ('error' in body) {
      setMessage({ text: ERRORS[body.error.code] ?? 'Erreur.', error: true })
      return
    }
    setView(body.view)
    setDraft(null)
    setMessage({
      text: 'Allure enregistrée : les autres joueurs la verront partout.',
      error: false,
    })
    fireBurst(true)
  }

  return (
    <>
      {title}
      <Scene label="Salle du château" art="art-hall" backdrop={<HallBackdrop />}>
        <span style={at('32.3%', 'auto', { bottom: '33%', transform: 'translateX(-50%)' })}>
          <PlayerCat playerId={userId} cat={catOfView(view, shown)} size={160} label="Votre chat" />
        </span>
        {burst && <Burst key={burst.n} left="32.3%" top="40%" />}
      </Scene>
      <div className="avatar-panels">
        <section className="panel" aria-label="Allure de mon chat">
          <h2>Allure</h2>
          <LookPanel look={shown} onChange={setDraft} />
          <button type="button" className="wide" disabled={!changed} onClick={save}>
            Enregistrer mon chat
          </button>
          {message && (
            <p className={message.error ? 'error' : 'muted'} role="status">
              {message.text}
            </p>
          )}
        </section>
        <section className="panel" aria-label="Équipement porté">
          <h2>Équipement porté</h2>
          <ul className="worn">
            {SLOTS.map((slot) => {
              const item = view.equipped[slot]
              return (
                <li key={slot}>
                  <span className="muted">{look(slot).label}</span>{' '}
                  {item ? (
                    <>
                      <Entity kind={item.recipe} showLabel />{' '}
                      <span className="quality" data-quality={item.quality}>
                        {look(item.quality).label}
                      </span>
                    </>
                  ) : (
                    <span className="muted">aucun</span>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="muted">{bonusText(view.bonuses) || 'Aucun bonus pour le moment.'}</p>
          <Link className="button" href="/forge">
            Forger et équiper à la forge
          </Link>
        </section>
      </div>
    </>
  )
}
