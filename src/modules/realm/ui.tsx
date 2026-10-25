'use client'
import { hc } from 'hono/client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useChannel } from '@/platform/realtime/use-channel'
import { CatAvatar } from '@/ui/art/cat-avatar'
import { Burst, FloatText } from '@/ui/art/effects'
import { at, Scene } from '@/ui/art/scene'
import { useFlash } from '@/ui/art/use-flash'
import { VillageBackdrop } from '@/ui/art/village-map'
import { Entity } from '@/ui/entity'
import type { RealmApi } from './api'
import {
  BUILDINGS,
  type Building,
  type DomainError,
  MAX_LEVEL,
  RESOURCES,
  type Stock,
  stockAt,
  type VillageView,
  villageChannel,
} from './contracts'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
const client = hc<RealmApi>('/api/realm')

/** Erreurs que l'API peut renvoyer : erreurs métier et erreur de validation. */
type ApiError = { code: DomainError['code'] | 'INVALID_INPUT'; message?: string }

/** Message affiché au joueur pour chaque erreur. */
const ERRORS: Record<ApiError['code'], string> = {
  INVALID_INPUT: 'Saisie invalide.',
  ALREADY_FOUNDED: 'Village déjà fondé.',
  NOT_FOUNDED: "Aucun village pour l'instant.",
  MAX_LEVEL_REACHED: 'Niveau maximum atteint.',
  INSUFFICIENT_RESOURCES: 'Ressources insuffisantes.',
}

/** Indique si le stock couvre un coût ; faux si le coût est absent (niveau maximal). */
function canAfford(stock: Stock, cost: Partial<Stock> | null) {
  return !!cost && Object.entries(cost).every(([r, n]) => stock[r as keyof Stock] >= (n ?? 0))
}

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

/**
 * Lieux de la carte : les trois bâtiments du domaine, le château, et les portes des autres
 * modules. La position (en pourcentage du décor) est celle du repère cliquable.
 */
const PLACES = {
  castle: {
    left: '33%',
    top: '57%',
    pin: 'Château',
    text: "Le cœur du royaume des chats : c'est ici que vous composez l'allure de votre chat.",
  },
  sawmill: {
    left: '6%',
    top: '81%',
    pin: 'Bateau de pêche',
    text: 'Il rapporte le poisson du lac.',
  },
  quarry: { left: '14%', top: '38%', pin: 'Ferme', text: 'Les vaches du royaume donnent le lait.' },
  mine: { left: '51%', top: '84%', pin: 'Jardin', text: 'Une herbe rare, qui luit sous la lune.' },
  dungeon: {
    left: '57%',
    top: '9%',
    pin: 'Crypte',
    text: 'Rats en armure et Aspirateur dévoreur d’âmes.',
  },
  market: {
    left: '47%',
    top: '43%',
    pin: 'Marché',
    text: 'Échangez vos ressources avec les autres joueurs.',
  },
  tavern: {
    left: '25%',
    top: '73%',
    pin: 'Taverne',
    text: 'Discutez au coin du feu avec les joueurs présents.',
  },
  forge: {
    left: '60%',
    top: '75%',
    pin: 'Forge',
    text: "Fabriquez l'équipement de votre chat, et améliorez la forge.",
  },
} as const
type Place = keyof typeof PLACES

/** Adresse de la page de chaque lieu qui mène à un autre module. */
const LINKS: Partial<Record<Place, { href: string; verb: string }>> = {
  castle: { href: '/avatar', verb: 'Personnaliser mon chat' },
  dungeon: { href: '/dungeon', verb: 'Entrer dans la crypte' },
  market: { href: '/market', verb: 'Aller au marché' },
  tavern: { href: '/tavern', verb: 'Pousser la porte' },
  forge: { href: '/forge', verb: 'Entrer dans la forge' },
}

const isBuilding = (place: Place): place is Building =>
  (BUILDINGS as readonly string[]).includes(place)

/** Centre approximatif du repère d'un lieu, où jouer les effets. */
const centerOf = (place: Place) => ({
  left: `calc(${PLACES[place].left} + 52px)`,
  top: `calc(${PLACES[place].top} + 18px)`,
})

/** Écran du Village : fondation, stock et bâtiments, mis à jour en temps réel. */
export function VillageScreen({ userId }: { userId: string }) {
  // undefined : chargement en cours ; null : aucun village fondé.
  const [view, setView] = useState<VillageView | null | undefined>(undefined)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Place>('castle')
  // Effets visuels : gerbe sur le lieu cliqué, rebond et texte après une amélioration.
  const [burst, fireBurst] = useFlash<Place>(900)
  const [gain, fireGain] = useFlash<{ place: Building; text: string }>(1600)
  const [meow, fireMeow] = useFlash<number>(1200)

  // REQUÊTE : lecture de la vue du village.
  const refresh = useCallback(async () => {
    const res = await client.village.$get()
    if (res.ok) setView((await res.json()).view)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // TEMPS RÉEL : chaque événement du village, y compris s'il provient d'un autre onglet
  // ou d'un autre appareil, provoque une relecture de la vue.
  const status = useChannel(villageChannel(userId), refresh)

  // Le stock est extrapolé localement deux fois par seconde, sans interroger le serveur.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [])

  // COMMANDES : chaque réponse contient la vue à jour, ou une erreur.
  async function found(name: string) {
    const res = await client.village.$post({ json: { name } })
    handle(await res.json())
  }
  async function upgrade(building: Building) {
    const res = await client.village.upgrade.$post({ json: { building } })
    const body = await res.json()
    if (handle(body) && 'view' in body) {
      fireBurst(building)
      fireGain({ place: building, text: `Niveau ${body.view.levels[building]} !` })
    }
  }
  /** Applique la réponse d'une commande ; vrai si elle a réussi. */
  function handle(body: { view: VillageView } | { error: ApiError }) {
    if ('error' in body) {
      setError(ERRORS[body.error.code])
      return false
    }
    setError(null)
    setView(body.view)
    return true
  }
  function select(place: Place) {
    setSelected(place)
    fireBurst(place)
  }

  const title = (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1>
        <Entity kind="village" /> {view?.name ?? 'Royaumes'}
      </h1>
      <span className="status" data-status={status}>
        {STATUS_LABELS[status]}
      </span>
    </div>
  )

  // Chargement en cours.
  if (view === undefined) return title

  const levels = view?.levels ?? { sawmill: 0, quarry: 0, mine: 0 }
  const stock = view ? stockAt(view, now) : null

  // Aucun village : la carte est déserte, le panneau propose de fonder le village.
  const overlay =
    view === null ? (
      <div className="panel">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            found(String(new FormData(e.currentTarget).get('name')))
          }}
        >
          <label htmlFor="name">Nommez votre village</label>
          <input id="name" name="name" required minLength={2} maxLength={30} />
          <button type="submit">Fonder</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    ) : (
      <PlacePanel
        place={selected}
        view={view}
        stock={stock as Stock}
        error={error}
        onUpgrade={upgrade}
      />
    )

  return (
    <>
      {title}
      {view && stock && (
        <section className="panel stock" aria-label="Ressources">
          {RESOURCES.map((r) => (
            <div key={r}>
              <Entity kind={r} showLabel /> {Math.floor(stock[r])}
              <small>+{view.ratesPerMinute[r]} / min</small>
            </div>
          ))}
        </section>
      )}
      <Scene
        label="Carte du royaume"
        art="art-map"
        backdrop={<VillageBackdrop levels={levels} pop={gain?.value.place} popTick={gain?.n} />}
        overlay={overlay}
      >
        {/* Deux chats se promènent ; un clic les fait sauter et miauler. */}
        {[
          {
            left: '34%',
            top: '63%',
            size: 44,
            kitten: false,
            fur: '#8f8a99',
            eyes: '#7cf08f',
            say: 'Miaou !',
          },
          {
            left: '20%',
            top: '50%',
            size: 38,
            kitten: true,
            fur: '#efdcb8',
            eyes: '#ffb23f',
            say: 'Mrrp ?',
          },
        ].map((cat, index) => (
          <span
            key={cat.left}
            className="walker"
            style={at(cat.left, cat.top, { animationDelay: `-${index * 6}s` })}
          >
            <button
              type="button"
              className="walkcat"
              aria-label={cat.kitten ? 'Caresser le chaton' : 'Caresser le chat'}
              onClick={() => fireMeow(index)}
            >
              <span
                className={meow?.value === index ? 'hop' : undefined}
                key={meow?.value === index ? meow.n : 0}
              >
                <CatAvatar
                  size={cat.size}
                  kitten={cat.kitten}
                  fur={cat.fur}
                  eyes={cat.eyes}
                  helmet={false}
                  armor={false}
                  weapon={false}
                  cape={!cat.kitten}
                  label=""
                />
              </span>
              {meow?.value === index && (
                <span className="meow" key={`meow-${meow.n}`}>
                  {cat.say}
                </span>
              )}
            </button>
          </span>
        ))}

        {burst && <Burst key={burst.n} {...centerOf(burst.value)} />}
        {gain && <FloatText key={gain.n} {...centerOf(gain.value.place)} text={gain.value.text} />}

        {/* Repères des lieux : les bâtiments ouvrent leur fiche dans le panneau. */}
        {view &&
          (Object.keys(PLACES) as Place[]).map((place) => {
            // Un bâtiment est améliorable si le stock du moment couvre son prochain coût.
            const ready =
              isBuilding(place) && stock !== null && canAfford(stock, view.nextCosts[place])
            return (
              <button
                key={place}
                type="button"
                className="pin"
                data-ready={ready || undefined}
                aria-pressed={selected === place}
                style={at(PLACES[place].left, PLACES[place].top)}
                onClick={() => select(place)}
              >
                {PLACES[place].pin}
                {ready && (
                  <>
                    <span className="pin-ready" aria-hidden="true">
                      ▲
                    </span>
                    <span className="sr-only"> : amélioration possible</span>
                  </>
                )}
              </button>
            )
          })}
      </Scene>
    </>
  )
}

/** Fiche du lieu choisi sur la carte : niveau, production et amélioration d'un bâtiment. */
function PlacePanel({
  place,
  view,
  stock,
  error,
  onUpgrade,
}: {
  place: Place
  view: VillageView
  stock: Stock
  error: string | null
  onUpgrade: (building: Building) => void
}) {
  const link = LINKS[place]
  return (
    <div className="panel">
      <p className="kicker">
        {isBuilding(place) ? 'Bâtiment' : place === 'castle' ? 'Votre village' : 'Lieu'}
      </p>
      <h2>
        {isBuilding(place) ? (
          <Entity kind={place} showLabel />
        ) : place === 'castle' ? (
          view.name
        ) : (
          PLACES[place].pin
        )}
      </h2>
      <p className="muted">{PLACES[place].text}</p>
      {isBuilding(place) && (
        <BuildingDetails building={place} view={view} stock={stock} onUpgrade={onUpgrade} />
      )}
      {link && (
        <Link className="button" href={link.href}>
          {link.verb}
        </Link>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

/** Niveau, production, coût et bouton d'amélioration d'un bâtiment. */
function BuildingDetails({
  building,
  view,
  stock,
  onUpgrade,
}: {
  building: Building
  view: VillageView
  stock: Stock
  onUpgrade: (building: Building) => void
}) {
  const level = view.levels[building]
  const cost = view.nextCosts[building]
  // Ressource produite par chaque bâtiment, dans l'ordre du catalogue.
  const resource = RESOURCES[BUILDINGS.indexOf(building)]
  return (
    <>
      <div className="line">
        <span>Niveau</span>
        <strong>
          {level} / {MAX_LEVEL}
        </strong>
      </div>
      <div className="gauge">
        <div style={{ width: `${(level / MAX_LEVEL) * 100}%` }} />
      </div>
      <div className="line">
        <span>Production</span>
        <strong>
          +{view.ratesPerMinute[resource]} <Entity kind={resource} showLabel /> / min
        </strong>
      </div>
      <div className="line">
        <span>Coût</span>
        <strong>
          {cost
            ? Object.entries(cost).map(([r, n]) => (
                <span key={r}>
                  {n} <Entity kind={r} showLabel />{' '}
                </span>
              ))
            : '—'}
        </strong>
      </div>
      <button
        type="button"
        className="wide"
        disabled={!canAfford(stock, cost)}
        onClick={() => onUpgrade(building)}
      >
        {cost === null ? 'Niveau maximal' : level === 0 ? 'Construire' : 'Améliorer'}
      </button>
    </>
  )
}
