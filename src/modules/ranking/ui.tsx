'use client'
import { hc } from 'hono/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type ChannelEvent, useChannel } from '@/platform/realtime/use-channel'
import { CatAvatar } from '@/ui/art/cat-avatar'
import { lookOf } from '@/ui/art/color'
import { Hearts } from '@/ui/art/effects'
import { HallBackdrop } from '@/ui/art/hall-of-heroes'
import { at, Scene } from '@/ui/art/scene'
import { useFlash } from '@/ui/art/use-flash'
import { Entity } from '@/ui/entity'
import type { RankingApi } from './api'
import { RANKING_CHANNEL, type Ranking } from './contracts'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
const client = hc<RankingApi>('/api/ranking')

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

/** Délai entre deux relectures, tant que la projection n'a pas atteint l'événement annoncé. */
const RETRY_MS = 1_000

/** Nombre maximal de relectures pour un même événement annoncé. */
const MAX_READS = 10

/**
 * Places du podium, dans l'ordre 1, 2, 3 : position (en pourcentage du décor, ramené au bas
 * du chat) et taille. Le décor dessine les marches à ces endroits.
 */
const PODIUM = [
  { left: '32.3%', bottom: '35.4%', size: 128, place: '1re place' },
  { left: '25.6%', bottom: '27%', size: 110, place: '2e place' },
  { left: '39%', bottom: '22.3%', size: 104, place: '3e place' },
]

/** Écran du Classement : les meilleurs joueurs, le joueur connecté étant mis en évidence. */
export function RankingScreen({ userId }: { userId: string }) {
  // undefined : chargement en cours.
  const [ranking, setRanking] = useState<Ranking | undefined>(undefined)

  // REQUÊTE : la lecture déclenche, côté serveur, le rattrapage de la projection.
  // Renvoie la position jusqu'à laquelle le classement reçu est à jour ; 0 en cas d'échec.
  const refresh = useCallback(async () => {
    const res = await client.players.$get()
    if (!res.ok) return 0
    const body = await res.json()
    setRanking(body)
    return body.position
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Position du dernier événement annoncé, et indicateur d'une relecture en cours.
  const wanted = useRef(0)
  const following = useRef(false)

  // TEMPS RÉEL : le canal annonce un événement qui modifie le classement. Le classement est
  // relu jusqu'à ce que la projection ait atteint la position de cet événement : elle peut
  // s'être arrêtée, quelques secondes, devant une position manquante.
  const follow = useCallback(
    async (event: ChannelEvent) => {
      wanted.current = Math.max(wanted.current, event.position)
      // Une relecture est déjà en cours : elle tiendra compte de la nouvelle position.
      if (following.current) return
      following.current = true
      try {
        for (let read = 0; read < MAX_READS; read++) {
          if ((await refresh()) >= wanted.current) return
          await new Promise((resolve) => setTimeout(resolve, RETRY_MS))
        }
      } finally {
        following.current = false
      }
    },
    [refresh],
  )

  const status = useChannel(RANKING_CHANNEL, follow)
  const entries = ranking?.entries
  // Un clic sur un chat du podium le fait ronronner.
  const [purr, firePurr] = useFlash<string>(1400)
  // Une ligne qui vient de changer clignote : la mise à jour se voit.
  const [changed, fireChanged] = useFlash<Set<string>>(1600)
  const previous = useRef<Ranking | undefined>(undefined)
  useEffect(() => {
    const before = previous.current
    previous.current = ranking
    if (!before || !ranking) return
    const old = new Map(before.entries.map((entry) => [entry.playerId, entry]))
    const moved = ranking.entries
      .filter((entry) => {
        const prior = old.get(entry.playerId)
        return !prior || prior.rank !== entry.rank || prior.gamesWon !== entry.gamesWon
      })
      .map((entry) => entry.playerId)
    if (moved.length > 0) fireChanged(new Set(moved))
  }, [ranking, fireChanged])
  const mine = entries?.find((entry) => entry.playerId === userId)
  const ahead = mine ? entries?.find((entry) => entry.rank === mine.rank - 1) : undefined

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>
          <Entity kind="ranking" /> Classement
        </h1>
        <span className="status" data-status={status}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <Scene
        label="Salle des héros"
        art="art-hall"
        backdrop={<HallBackdrop />}
        overlay={
          mine && (
            <div className="panel">
              <p className="kicker">Votre rang</p>
              <h2>
                {mine.rank}
                <sup>{mine.rank === 1 ? 're' : 'e'}</sup> sur {entries?.length}
              </h2>
              <p className="muted">
                {ahead
                  ? `Encore ${ahead.gamesWon - mine.gamesWon + 1} victoire(s) pour dépasser ${ahead.label}.`
                  : 'Vous êtes en tête du royaume !'}
              </p>
            </div>
          )
        }
      >
        {entries?.slice(0, 3).map((entry, index) => (
          <button
            key={entry.playerId}
            type="button"
            className="seat"
            aria-label={`${entry.label}, ${PODIUM[index].place}`}
            style={at(PODIUM[index].left, 'auto', {
              bottom: PODIUM[index].bottom,
              width: PODIUM[index].size,
              transform: 'translateX(-50%)',
            })}
            onClick={() => firePurr(entry.playerId)}
          >
            <CatAvatar
              {...lookOf(entry.playerId)}
              size={PODIUM[index].size}
              helmet={entry.playerId === userId}
              label=""
            />
            {purr?.value === entry.playerId && (
              <span key={purr.n}>
                <span className="purr">Rrrrr...</span>
                <Hearts left="50%" top="30%" />
              </span>
            )}
          </button>
        ))}
      </Scene>
      <section className="panel" aria-label="Classement des joueurs">
        {entries?.length === 0 && <p className="muted">Aucun joueur classé pour le moment.</p>}
        {entries && entries.length > 0 && (
          <table className="ranking">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Joueur</th>
                <th>Victoires</th>
                <th>Expéditions</th>
                <th>
                  <Entity kind="gold" />
                </th>
                <th>Meilleur butin</th>
                <th>Améliorations</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={
                    changed?.value.has(entry.playerId)
                      ? `${entry.playerId}-${changed.n}`
                      : entry.playerId
                  }
                  className={changed?.value.has(entry.playerId) ? 'flash' : undefined}
                  aria-current={entry.playerId === userId ? 'true' : undefined}
                >
                  <td className="rank" data-rank={entry.rank}>
                    {entry.rank}
                  </td>
                  <td>{entry.label}</td>
                  <td>{entry.gamesWon}</td>
                  <td>{entry.gamesPlayed}</td>
                  <td>{entry.gold}</td>
                  <td>{entry.bestLoot}</td>
                  <td>{entry.upgrades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
