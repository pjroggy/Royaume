'use client'
import { hc } from 'hono/client'
import { useCallback, useEffect, useState } from 'react'
import { useChannel } from '@/platform/realtime/use-channel'
import { CatAvatar } from '@/ui/art/cat-avatar'
import { lookOf } from '@/ui/art/color'
import { Burst, FloatText } from '@/ui/art/effects'
import { ForgeBackdrop, HotMetal } from '@/ui/art/forge-room'
import { at, Scene } from '@/ui/art/scene'
import { useFlash } from '@/ui/art/use-flash'
import { Entity } from '@/ui/entity'
import { look } from '@/ui/theme'
import { useCountdown } from '@/ui/use-countdown'
import type { ForgeApi } from './api'
import {
  type Amounts,
  ENGRAVING_MAX,
  type ForgeError,
  type ForgeView,
  forgeChannel,
  type ItemView,
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
}

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

/** Couleur de cape de chaque recette de cape, pour le chat équipé. */
const CAPE_COLORS: Record<string, string> = { midnightCape: '#24324a', catnipCape: '#2f6a2a' }

/** Affiche des quantités de ressources : « 60 🐟 40 🥛 ». */
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
  const forging = view?.current?.status === 'forging' ? view.current.readyAt : null
  const remaining = useCountdown(forging, refresh)

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
      fireBurst(true)
      fireGain(`${look(item.recipe).label} ${look(item.quality).label} !`)
    }
  }
  const cancel = async () => handle(await client.orders.cancel.$post())
  const equip = async (itemId: string) => handle(await client.equip.$post({ json: { itemId } }))
  const unequip = async (slot: Slot) => handle(await client.unequip.$post({ json: { slot } }))
  const engrave = async (itemId: string, text: string) =>
    handle(await client.engrave.$post({ json: { itemId, text } }))

  const title = (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1>
        <Entity kind="forge" /> Forge
        {view && (
          <span className="muted">
            {' '}
            - niveau {view.level} / {view.maxLevel}, qualité {look(view.quality).label}
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
  const worn = (slot: Slot) => view.equipped[slot] !== null

  return (
    <>
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
          <CatAvatar
            {...lookOf(userId)}
            size={190}
            helmet={worn('helmet')}
            armor={worn('armor')}
            weapon={worn('weapon')}
            cape={worn('cape')}
            capeColor={CAPE_COLORS[view.equipped.cape?.recipe ?? ''] ?? '#6a1a2a'}
            label="Votre chat et son équipement"
          />
        </span>

        {/* L'enclume : un objet chauffé à blanc pendant la fabrication, prêt ensuite. */}
        {current?.kind === 'item' && current.status !== 'paying' && (
          <span className="anvil-item" style={at('42%', '58%', { width: '12%' })}>
            {current.status === 'forging' ? (
              <HotMetal />
            ) : (
              <button type="button" className="ready-item" onClick={collect}>
                <Entity kind={current.recipe ?? 'forge'} /> Retirer
              </button>
            )}
          </span>
        )}

        {burst && <Burst key={burst.n} left="48%" top="68%" />}
        {gain && <FloatText key={gain.n} left="48%" top="58%" text={gain.value} />}
      </Scene>

      <Inventory view={view} onEquip={equip} onUnequip={unequip} onEngrave={engrave} />
    </>
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
  const current = view.current
  if (current?.status === 'paying') {
    return (
      <div className="panel">
        <p className="kicker">Sur l'enclume</p>
        <p>Le Village prépare le paiement...</p>
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
            <div className="gauge">
              <div style={{ width: `${Math.min(100, (1 - left / total) * 100)}%` }} />
            </div>
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
      <div className="gauge">
        <div style={{ width: `${(view.level / view.maxLevel) * 100}%` }} />
      </div>
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
        {view.recipes.map((recipe) => (
          <li key={recipe.recipe}>
            <span>
              <Entity kind={recipe.recipe} showLabel />
              <small className="muted">
                {' '}
                {look(recipe.slot).label}, {duration(recipe.durationMs)}, {bonusText(recipe.bonus)}
              </small>
              <br />
              <Cost amounts={recipe.cost} />
            </span>
            <button type="button" disabled={busy} onClick={() => onOrder(recipe.recipe)}>
              Forger
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Inventaire : objets forgés, équipement porté et gravures. */
function Inventory({
  view,
  onEquip,
  onUnequip,
  onEngrave,
}: {
  view: ForgeView
  onEquip: (itemId: string) => void
  onUnequip: (slot: Slot) => void
  onEngrave: (itemId: string, text: string) => void
}) {
  return (
    <section className="panel" aria-label="Inventaire">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Inventaire</h2>
        <span className="muted">
          {view.inventory.length} objet(s) - équipement : {bonusText(view.bonuses) || 'aucun bonus'}
        </span>
      </div>
      <div className="slots">
        {SLOTS.map((slot) => {
          const worn = view.equipped[slot]
          return (
            <span key={slot} className="slot" data-filled={worn !== null}>
              <small className="muted">{look(slot).label}</small>
              <br />
              {worn ? <Entity kind={worn.recipe} showLabel /> : <span className="muted">vide</span>}
            </span>
          )
        })}
      </div>
      {view.inventory.length === 0 && (
        <p className="muted">Aucun objet pour le moment : forgez-en un !</p>
      )}
      <ul className="items">
        {view.inventory.map((item) => (
          <ItemRow
            key={item.itemId}
            item={item}
            onEquip={onEquip}
            onUnequip={onUnequip}
            onEngrave={onEngrave}
          />
        ))}
      </ul>
    </section>
  )
}

/** Un objet de l'inventaire, avec ses actions. */
function ItemRow({
  item,
  onEquip,
  onUnequip,
  onEngrave,
}: {
  item: ItemView
  onEquip: (itemId: string) => void
  onUnequip: (slot: Slot) => void
  onEngrave: (itemId: string, text: string) => void
}) {
  const [text, setText] = useState(item.engraving ?? '')
  return (
    <li data-equipped={item.equipped || undefined}>
      <span>
        <Entity kind={item.recipe} showLabel />{' '}
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
      </form>
    </li>
  )
}
