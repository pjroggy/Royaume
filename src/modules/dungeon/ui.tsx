'use client'
import { hc } from 'hono/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PlayerCat, useCats } from '@/modules/forge/ui'
import { useChannel } from '@/platform/realtime/use-channel'
import { CatAvatar } from '@/ui/art/cat-avatar'
import { lookOf } from '@/ui/art/color'
import { DungeonBackdrop } from '@/ui/art/dungeon-room'
import { Burst, Coins, FloatText, Hearts } from '@/ui/art/effects'
import { MonsterSprite } from '@/ui/art/monsters'
import { at, Scene } from '@/ui/art/scene'
import { useFlash } from '@/ui/art/use-flash'
import { Entity } from '@/ui/entity'
import { look } from '@/ui/theme'
import { useCountdown } from '@/ui/use-countdown'
import type { DungeonApi } from './api'
import {
  type Action,
  DIFFICULTIES,
  type Difficulty,
  type Effect,
  type GameError,
  type GameView,
  gameChannel,
  MAX_HEROES,
  type Monster,
  type OpenGame,
} from './contracts'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
const client = hc<DungeonApi>('/api/dungeon')

/** Erreurs que l'API peut renvoyer : erreurs métier et erreur de validation. */
type ApiError = { code: GameError['code'] | 'INVALID_INPUT'; message?: string }

/** Message affiché au joueur pour chaque erreur. */
const ERRORS: Record<ApiError['code'], string> = {
  INVALID_INPUT: 'Saisie invalide.',
  GAME_NOT_FOUND: 'Expédition introuvable.',
  ALREADY_EXISTS: 'Expédition déjà ouverte.',
  WRONG_PHASE: "Cette action n'est plus possible.",
  GAME_FULL: "L'expédition est complète.",
  ALREADY_JOINED: "Vous faites déjà partie de l'expédition.",
  NOT_A_MEMBER: "Vous ne faites pas partie de l'expédition.",
  NOT_HOST: "Seul l'hôte peut lancer l'expédition.",
  NOT_YOUR_TURN: "Ce n'est pas votre tour.",
  HERO_DOWN: 'Votre héros est tombé.',
  ROUND_OVER: 'La manche est déjà terminée.',
  ALREADY_CHOSEN: 'Vous avez déjà choisi votre action.',
  INVALID_TARGET: 'Cible invalide.',
}

/** Libellé de chaque niveau de difficulté. */
const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'Facile', hard: 'Difficile' }

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

// ---------------------------------------------------------------------------
// Liste des expéditions ouvertes
// ---------------------------------------------------------------------------

/** Écran d'accueil du Donjon : expéditions ouvertes et ouverture d'une expédition. */
export function DungeonLobby({ userId }: { userId: string }) {
  const router = useRouter()
  // Le chat du joueur (allure et équipement), lu auprès de la Forge.
  const cats = useCats([userId])
  const [games, setGames] = useState<OpenGame[] | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  const refresh = useCallback(async () => {
    const res = await client.games.$get()
    if (res.ok) setGames((await res.json()).games)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function open() {
    const res = await client.games.$post({ json: { difficulty } })
    if (res.ok) router.push(`/dungeon/${(await res.json()).gameId}`)
  }

  return (
    <>
      <h1>
        <Entity kind="dungeon" /> Donjon
      </h1>
      <Scene
        label="Entrée de la crypte"
        art="art-dun"
        backdrop={<DungeonBackdrop />}
        overlay={
          <>
            <div className="panel row">
              <label htmlFor="difficulty">Niveau</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((level) => (
                  <option key={level} value={level}>
                    {DIFFICULTY_LABELS[level]}
                  </option>
                ))}
              </select>
              <button type="button" onClick={open}>
                Ouvrir une nouvelle expédition
              </button>
            </div>
            <section className="panel" aria-label="Expéditions ouvertes">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2>Expéditions ouvertes</h2>
                <button className="link" type="button" onClick={refresh}>
                  Actualiser
                </button>
              </div>
              {games?.length === 0 && (
                <p className="muted">Aucune expédition ouverte pour le moment.</p>
              )}
              <ul className="games">
                {games?.map((game) => (
                  <li key={game.gameId}>
                    <span>
                      Expédition de {game.hostName}{' '}
                      <span className="muted">
                        ({game.heroCount}/{MAX_HEROES} héros)
                      </span>
                    </span>
                    <Link href={`/dungeon/${game.gameId}`}>Voir</Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        }
      >
        {/* Une équipe attend devant la crypte ; l'Aspirateur ronfle au fond de la salle. */}
        <span style={at('4%', '40%')}>
          <PlayerCat playerId={userId} cat={cats[userId]} size={150} label="Votre chat" />
        </span>
        <span style={at('16%', '48%')}>
          <CatAvatar
            size={110}
            kitten
            fur="#efdcb8"
            belly="#fff6e6"
            helmet={false}
            armor={false}
            weapon={false}
            label=""
          />
        </span>
        <span className="sleeping" style={at('40%', '22%', { width: '17%' })}>
          <MonsterSprite kind="troll" />
        </span>
      </Scene>
    </>
  )
}

// ---------------------------------------------------------------------------
// Expédition
// ---------------------------------------------------------------------------

/** Nom affiché d'un monstre, numéroté si la salle en contient plusieurs du même type. */
function monsterName(monster: Monster, monsters: Monster[]) {
  const sameKind = monsters.filter((other) => other.kind === monster.kind)
  // Le nom affiché vient de la couche de thème : le contenu du domaine n'en est pas modifié.
  const name = look(monster.kind).label
  return sameKind.length > 1 ? `${name} ${sameKind.indexOf(monster) + 1}` : name
}

/** Description d'une action, telle que le joueur l'a choisie. */
function describeAction(action: Action, nameOf: (id: string) => string) {
  if (action.type === 'attack') return `attaquer ${nameOf(action.target)}`
  if (action.type === 'heal') return `soigner ${nameOf(action.target)}`
  return 'se défendre'
}

/** Préposition « de » devant un verbe à l'infinitif, élidée devant une voyelle. */
const ofVerb = (text: string) => (/^[aeéiou]/i.test(text) ? `d'${text}` : `de ${text}`)

/** Description d'un effet de la dernière manche. */
function describeEffect(effect: Effect, nameOf: (id: string) => string) {
  return effect.kind === 'damage'
    ? `${nameOf(effect.source)} inflige ${effect.amount} dégâts à ${nameOf(effect.target)}`
    : `${nameOf(effect.source)} rend ${effect.amount} points de vie à ${nameOf(effect.target)}`
}

/** Emplacements des héros (quatre au plus) et des monstres (trois au plus) sur le décor. */
const HERO_SLOTS = [
  ['14%', '38%'],
  ['3%', '44%'],
  ['24%', '46%'],
  ['10%', '56%'],
] as const
const MONSTER_SLOTS = [
  ['38%', '36%'],
  ['46%', '46%'],
  ['33%', '50%'],
] as const
const BOSS_SLOT = ['47%', '24%'] as const

/** Centre approximatif d'un combattant, où jouer les effets qui le touchent. */
const centerOfSlot = ([left, top]: readonly [string, string]) => ({
  left: `calc(${left} + 50px)`,
  top: `calc(${top} + 20px)`,
})

/** Écran d'une expédition : salon, exploration, combat et fin de l'expédition. */
export function DungeonGame({ gameId, userId }: { gameId: string; userId: string }) {
  // undefined : chargement en cours ; null : expédition introuvable.
  const [view, setView] = useState<GameView | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const param = { id: gameId }
  // Effets visuels : résultat de la dernière manche, choix du joueur, trésor trouvé.
  const [roundFx, fireRoundFx] = useFlash<Effect[]>(1800)
  const [choiceFx, fireChoiceFx] = useFlash<Action>(1400)
  const [lootFx, fireLootFx] = useFlash<true>(1500)
  const seenRound = useRef<number | null>(null)
  const seenRoom = useRef<number | null>(null)

  // Lorsqu'une manche est résolue, ses effets sont joués sur le décor : entailles et dégâts
  // sur les cibles, soins en vert. La première lecture ne rejoue pas une manche ancienne.
  useEffect(() => {
    const round = view?.lastRound?.round ?? null
    if (round !== null && seenRound.current !== null && round !== seenRound.current) {
      fireRoundFx(view?.lastRound?.effects ?? [])
    }
    seenRound.current = round
    const room = view?.room ?? null
    if (
      room !== null &&
      seenRoom.current !== null &&
      room !== seenRoom.current &&
      view?.currentRoom?.kind === 'treasure'
    ) {
      fireLootFx(true)
    }
    seenRoom.current = room
  }, [view, fireRoundFx, fireLootFx])

  // REQUÊTE : lecture de la vue de l'expédition, filtrée pour le joueur.
  const refresh = useCallback(async () => {
    const res = await client.games[':id'].$get({ param: { id: gameId } })
    if (res.ok) setView((await res.json()).view)
    else if (res.status === 404) setView(null)
  }, [gameId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // TEMPS RÉEL : seuls les membres écoutent le canal de l'expédition. Le canal ne transmet
  // aucune donnée : chaque notification provoque une relecture de la vue filtrée.
  const status = useChannel(view?.isMember ? gameChannel(gameId) : null, refresh)

  // COMMANDES : chaque réponse contient la vue à jour, ou une erreur.
  function handle(body: { view: GameView } | { error: ApiError }) {
    if ('error' in body) {
      setError(ERRORS[body.error.code])
      refresh()
    } else {
      setError(null)
      setView(body.view)
    }
  }
  const addCompanion = async () =>
    handle(await (await client.games[':id'].companion.$post({ param })).json())
  const join = async () => handle(await (await client.games[':id'].join.$post({ param })).json())
  const start = async () => handle(await (await client.games[':id'].start.$post({ param })).json())
  const openDoor = async () =>
    handle(await (await client.games[':id'].door.$post({ param })).json())
  async function act(action: Action) {
    if (!view) return
    const res = await client.games[':id'].action.$post({
      param,
      json: { round: view.round, action },
    })
    const body = await res.json()
    handle(body)
    if (!('error' in body)) fireChoiceFx(action)
  }

  // ÉCHÉANCE : lorsque le compte à rebours d'une manche ou d'un tour d'exploration atteint
  // zéro, la commande d'échéance fait enregistrer la suite de l'expédition, et donc
  // notifier tous les membres.
  const checkDeadline = useCallback(async () => {
    const res = await client.games[':id'].deadline.$post({ param: { id: gameId } })
    if (res.ok) setView((await res.json()).view)
  }, [gameId])
  const remaining = useCountdown(
    view?.isMember && (view.phase === 'combat' || view.phase === 'exploring')
      ? view.deadline
      : null,
    checkDeadline,
  )

  // Allure et équipement des héros joueurs, choisis à la Forge ; les compagnons restent des
  // chatons écuyers. La lecture est faite avant tout retour anticipé (règles des hooks).
  const cats = useCats(
    (view?.heroes ?? []).filter((hero) => !hero.companion).map((hero) => hero.id),
  )

  const title = (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1>
        <Entity kind="dungeon" /> Expédition
        {view && <span className="muted"> - {DIFFICULTY_LABELS[view.difficulty]}</span>}
      </h1>
      {view?.isMember && (
        <span className="status" data-status={status}>
          {STATUS_LABELS[status]}
        </span>
      )}
    </div>
  )

  if (view === undefined) return title
  if (view === null) {
    return (
      <>
        {title}
        <p className="error">{ERRORS.GAME_NOT_FOUND}</p>
        <Link href="/dungeon">Retour au Donjon</Link>
      </>
    )
  }

  // Noms des combattants, pour décrire les actions et les effets.
  const nameOf = (id: string) => {
    const hero = view.heroes.find((h) => h.id === id)
    if (hero) return hero.name
    const monster = view.monsters.find((m) => m.id === id)
    return monster ? monsterName(monster, view.monsters) : id
  }
  const me = view.heroes.find((hero) => hero.id === userId)
  const standingMonsters = view.monsters.filter((monster) => monster.hp > 0)
  const standingHeroes = view.heroes.filter((hero) => hero.hp > 0)

  // Position de chaque combattant sur le décor, pour y jouer les effets qui le concernent.
  const slotOf = (id: string) => {
    const hero = view.heroes.findIndex((h) => h.id === id)
    if (hero >= 0) return HERO_SLOTS[hero % HERO_SLOTS.length]
    const monster = view.monsters.findIndex((m) => m.id === id)
    // Le troll, plus grand, occupe le fond de la salle.
    if (view.monsters[monster]?.kind === 'troll') return BOSS_SLOT
    return MONSTER_SLOTS[Math.max(0, monster) % MONSTER_SLOTS.length]
  }
  const poseOf = (id: string) => {
    if (!roundFx) return 'idle' as const
    if (roundFx.value.some((e) => e.source === id && e.kind === 'damage')) return 'attack' as const
    if (roundFx.value.some((e) => e.target === id && e.kind === 'damage')) return 'hit' as const
    return 'idle' as const
  }
  const canAttack = view.phase === 'combat' && !!me && me.hp > 0 && !me.action

  return (
    <>
      {title}

      <Scene
        label={`Salle ${Math.max(1, view.room + 1)} de la crypte`}
        art="art-dun"
        backdrop={<DungeonBackdrop />}
        overlay={
          <>
            {/* Héros de l'expédition. */}
            <section className="panel heroes" aria-label="Héros">
              {view.heroes.map((hero) => (
                <div key={hero.id} className="fighter" data-down={hero.hp <= 0}>
                  <span>
                    <Entity kind={hero.companion ? 'companion' : 'hero'} /> {hero.name}
                    {hero.id === view.hostId && <span className="muted"> (hôte)</span>}
                    {hero.companion && <span className="muted"> (piloté par l'ordinateur)</span>}
                  </span>
                  <span className="muted">
                    {hero.hp}/{hero.maxHp} PV
                  </span>
                  {view.phase === 'combat' && hero.ready && <span className="ok">prêt</span>}
                  {view.turnHeroId === hero.id && <span className="ok">à son tour</span>}
                </div>
              ))}
            </section>

            {/* Salon : rejoindre ou lancer l'expédition. */}
            {view.phase === 'lobby' && (
              <div className="panel">
                <p className="muted">
                  Communiquez l'adresse de cette page aux joueurs que vous souhaitez inviter.
                </p>
                {!view.isMember && view.heroes.length < MAX_HEROES && (
                  <button type="button" onClick={join}>
                    Rejoindre l'expédition
                  </button>
                )}
                {view.isHost && view.heroes.length < MAX_HEROES && (
                  <button type="button" onClick={addCompanion}>
                    <Entity kind="companion" /> Ajouter un compagnon
                  </button>
                )}
                {view.isHost && (
                  <button type="button" onClick={start}>
                    Entrer dans le donjon
                  </button>
                )}
                {view.isMember && !view.isHost && (
                  <p className="muted">En attente du lancement par l'hôte.</p>
                )}
              </div>
            )}

            {/* Exploration : ouvrir la porte suivante, à tour de rôle. */}
            {view.phase === 'exploring' && (
              <div className="panel">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h2>Exploration</h2>
                  {remaining !== null && (
                    <span className="countdown" title="La porte s'ouvrira d'elle-même">
                      {remaining} s
                    </span>
                  )}
                </div>
                <p>
                  Salle {view.room + 1} sur {view.roomCount}
                  {view.currentRoom?.kind === 'treasure' &&
                    ` : un trésor de ${view.currentRoom.gold} ${look('gold').label}`}
                  {view.currentRoom?.kind === 'empty' && ' : une salle vide'}
                  {' - '}
                  <Entity kind="gold" /> {view.loot}
                </p>
                {view.turnHeroId === userId ? (
                  <button type="button" onClick={openDoor}>
                    <Entity kind="door" /> Ouvrir la porte suivante
                  </button>
                ) : (
                  <p className="muted">Au tour de {nameOf(view.turnHeroId ?? '')}.</p>
                )}
              </div>
            )}

            {/* Combat : monstres, compte à rebours et choix de l'action. */}
            {view.phase === 'combat' && (
              <div className="panel">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h2>
                    Combat - salle {view.room + 1}, manche {view.round}
                  </h2>
                  {remaining !== null && <span className="countdown">{remaining} s</span>}
                </div>
                <div className="monsters">
                  {view.monsters.map((monster) => (
                    <div key={monster.id} className="fighter" data-down={monster.hp <= 0}>
                      <span>
                        <Entity kind={monster.kind} /> {monsterName(monster, view.monsters)}
                      </span>
                      <span className="muted">
                        {monster.hp}/{monster.maxHp} PV
                      </span>
                    </div>
                  ))}
                </div>
                {me && me.hp > 0 && !me.action && (
                  <div className="actions">
                    {standingMonsters.map((monster) => (
                      <button
                        key={monster.id}
                        type="button"
                        onClick={() => act({ type: 'attack', target: monster.id })}
                      >
                        Attaquer {monsterName(monster, view.monsters)}
                      </button>
                    ))}
                    <button type="button" onClick={() => act({ type: 'defend' })}>
                      Se défendre
                    </button>
                    {standingHeroes.map((hero) => (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => act({ type: 'heal', target: hero.id })}
                      >
                        Soigner {hero.name}
                      </button>
                    ))}
                  </div>
                )}
                {me?.action && (
                  <p className="muted">
                    Votre choix : {describeAction(me.action, nameOf)}. En attente des autres héros.
                  </p>
                )}
              </div>
            )}

            {/* Fin de l'expédition. */}
            {(view.phase === 'won' || view.phase === 'lost') && (
              <div className="panel">
                <h2>{view.phase === 'won' ? 'Victoire !' : 'Défaite...'}</h2>
                <p>
                  Butin de l'expédition : <Entity kind="gold" /> {view.loot}
                </p>
                <Link href="/dungeon">Retour au Donjon</Link>
              </div>
            )}

            {/* Résultat de la dernière manche, connu de tous une fois la manche résolue. */}
            {view.lastRound && (
              <section className="panel" aria-label="Dernière manche">
                <h2>Manche {view.lastRound.round}</h2>
                <ul className="log">
                  {Object.entries(view.lastRound.actions).map(([heroId, action]) => (
                    <li key={heroId}>
                      {nameOf(heroId)} a choisi {ofVerb(describeAction(action, nameOf))}.
                    </li>
                  ))}
                  {view.lastRound.effects.map((effect) => (
                    // Chaque combattant n'agit qu'une fois par manche : ce triplet identifie l'effet.
                    <li key={`${effect.kind}-${effect.source}-${effect.target}`}>
                      {describeEffect(effect, nameOf)}.
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {error && <p className="error">{error}</p>}
          </>
        }
      >
        {/* Les héros, à gauche ; le joueur porte le casque à cornes. */}
        {view.heroes.map((hero, index) => {
          const [left, top] = HERO_SLOTS[index % HERO_SLOTS.length]
          return (
            <span
              key={hero.id}
              className="fighter-art"
              data-down={hero.hp <= 0}
              style={at(left, top)}
            >
              <span className="hp" aria-hidden="true">
                <span style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
              </span>
              {hero.companion ? (
                <CatAvatar
                  {...lookOf(hero.id)}
                  size={96}
                  kitten
                  helmet={false}
                  pose={poseOf(hero.id)}
                  label={hero.name}
                />
              ) : (
                <PlayerCat
                  playerId={hero.id}
                  cat={cats[hero.id]}
                  size={118}
                  pose={poseOf(hero.id)}
                  label={hero.name}
                />
              )}
              <span className="tag">{hero.name}</span>
            </span>
          )
        })}

        {/* Les monstres, à droite : un clic attaque, si le joueur n'a pas encore choisi. */}
        {view.phase === 'combat' &&
          view.monsters.map((monster, index) => {
            const [left, top] = MONSTER_SLOTS[index % MONSTER_SLOTS.length]
            const boss = monster.kind === 'troll'
            const name = monsterName(monster, view.monsters)
            return (
              <button
                key={monster.id}
                type="button"
                className="monster-art"
                data-down={monster.hp <= 0}
                data-hit={poseOf(monster.id) === 'hit' || undefined}
                disabled={!canAttack || monster.hp <= 0}
                aria-label={`Attaquer ${name}, ${monster.hp} points de vie sur ${monster.maxHp}`}
                style={at(boss ? '44%' : left, boss ? '14%' : top, { width: boss ? '17%' : '9%' })}
                onClick={() => act({ type: 'attack', target: monster.id })}
              >
                <span className="hp" aria-hidden="true">
                  <span style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                </span>
                <MonsterSprite kind={monster.kind} />
                <span className="tag">{name}</span>
              </button>
            )
          })}

        {/* Effets de la dernière manche, décalés pour se lire l'un après l'autre. */}
        {roundFx?.value.map((effect, index) => {
          const spot = centerOfSlot(slotOf(effect.target))
          return (
            <span
              key={`${roundFx.n}-${effect.kind}-${effect.source}-${effect.target}`}
              className="fx-delay"
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              {effect.kind === 'damage' && <Burst {...spot} />}
              <FloatText
                {...spot}
                text={`${effect.kind === 'damage' ? '-' : '+'}${effect.amount}`}
                tone={effect.kind === 'damage' ? 'damage' : 'heal'}
              />
            </span>
          )
        })}

        {/* Choix du joueur : bouclier pour la défense, cœurs verts pour un soin. */}
        {choiceFx?.value.type === 'defend' && me && (
          <span
            key={choiceFx.n}
            className="fx-shield"
            style={at(slotOf(me.id)[0], slotOf(me.id)[1], { width: '12%', height: '30%' })}
          />
        )}
        {choiceFx?.value.type === 'heal' && (
          <Hearts key={choiceFx.n} {...centerOfSlot(slotOf(choiceFx.value.target))} tone="green" />
        )}
        {lootFx && <Coins key={lootFx.n} left="30%" top="50%" />}
        {view.phase === 'won' && <Coins left="30%" top="45%" />}
      </Scene>
    </>
  )
}
