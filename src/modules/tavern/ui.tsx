'use client'
import { hc } from 'hono/client'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { useChannel } from '@/platform/realtime/use-channel'
import { CatAvatar } from '@/ui/art/cat-avatar'
import { lookOf } from '@/ui/art/color'
import { Hearts } from '@/ui/art/effects'
import { at, Scene } from '@/ui/art/scene'
import { TavernBackdrop } from '@/ui/art/tavern-room'
import { useFlash } from '@/ui/art/use-flash'
import { Entity } from '@/ui/entity'
import type { TavernApi } from './api'
import {
  HEARTBEAT_MS,
  MESSAGE_MAX_LENGTH,
  type MessageError,
  type PresentPlayer,
  TAVERN_CHANNEL,
  type TavernMessage,
} from './contracts'

/** Client HTTP typé, déduit de la sous-application Hono du module. */
const client = hc<TavernApi>('/api/tavern')

/** Libellé affiché pour chaque état de la connexion temps réel. */
const STATUS_LABELS = {
  connecting: 'Connexion...',
  open: 'Temps réel connecté',
  reconnecting: 'Reconnexion...',
} as const

/** Message affiché au joueur pour chaque erreur. */
function errorText(error: MessageError | { code: 'INVALID_INPUT' }): string {
  switch (error.code) {
    case 'EMPTY_MESSAGE':
      return 'Le message est vide.'
    case 'MESSAGE_TOO_LONG':
      return `Le message dépasse ${error.max} caractères.`
    case 'TOO_MANY_MESSAGES':
      return `Trop de messages : patientez ${Math.ceil(error.retryAfterMs / 1000)} secondes.`
    case 'INVALID_INPUT':
      return 'Saisie invalide.'
  }
}

/** Ajoute des messages à la liste, sans doublon, dans l'ordre de leurs identifiants. */
function merge(current: TavernMessage[], added: TavernMessage[]): TavernMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]))
  for (const message of added) byId.set(message.id, message)
  return [...byId.values()].sort((a, b) => a.id - b.id)
}

/**
 * Départ en cours de transmission. Un signal de présence attend qu'il soit reçu : sans cela,
 * un joueur qui quitte la Taverne puis y revient aussitôt pourrait voir son départ arriver
 * au serveur après son nouveau signal, et disparaître de la liste des présents.
 */
let leaving: Promise<unknown> = Promise.resolve()

/** Signale le départ du joueur. L'option keepalive maintient la requête pendant la fermeture de l'onglet. */
function leave() {
  leaving = fetch('/api/tavern/presence/leave', { method: 'POST', keepalive: true }).catch(() => {})
}

/** Heure d'un message, au format local. */
const timeOf = (at: number) =>
  new Date(at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

/** Places autour du feu : le joueur prend la première, les présents les suivantes. */
const SEATS = [
  { left: '8%', top: '47%', size: 128 },
  { left: '40%', top: '46%', size: 118 },
  { left: '49%', top: '46%', size: 118, flip: true },
  { left: '58%', top: '53%', size: 110, flip: true },
  { left: '1%', top: '57%', size: 100 },
  { left: '27%', top: '58%', size: 100 },
]

/** Écran de la Taverne : salon de discussion et joueurs présents. */
export function TavernScreen({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<TavernMessage[]>([])
  const [players, setPlayers] = useState<PresentPlayer[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Chat qui parle (sa dernière phrase s'affiche dans une bulle) et chat caressé.
  const [speaker, setSpeaker] = useState<string | null>(null)
  const [petted, firePet] = useFlash<string>(1200)

  // REQUÊTE : les derniers messages.
  const refresh = useCallback(async () => {
    const res = await client.messages.$get()
    if (!res.ok) return
    const latest = (await res.json()).messages
    setMessages((current) => merge(current, latest))
  }, [])

  // TEMPS RÉEL : chaque nouveau message est reçu avec son contenu, et ajouté à la liste.
  const status = useChannel(TAVERN_CHANNEL, (event) => {
    setMessages((current) => merge(current, [event.data as unknown as TavernMessage]))
  })

  // À chaque ouverture du canal, y compris après une reconnexion, l'historique est relu :
  // un message publié avant l'abonnement, ou pendant une interruption, n'est pas transmis
  // par le canal, qui ne diffuse que les messages à venir.
  useEffect(() => {
    if (status === 'open') refresh()
  }, [status, refresh])

  // PRÉSENCE : un signal immédiat, puis un signal régulier tant que la page est affichée.
  // Le départ est signalé lorsque le joueur quitte la page ou ferme l'onglet.
  useEffect(() => {
    const beat = async () => {
      await leaving
      const res = await client.presence.$post()
      if (res.ok) setPlayers((await res.json()).players)
    }
    beat()
    const timer = setInterval(beat, HEARTBEAT_MS)
    window.addEventListener('pagehide', leave)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', leave)
      leave()
    }
  }, [])

  // COMMANDE : publication d'un message.
  async function send(event: FormEvent) {
    event.preventDefault()
    const res = await client.messages.$post({ json: { body: draft } })
    const body = await res.json()
    if ('error' in body) {
      setError(errorText(body.error as MessageError))
    } else {
      setError(null)
      setDraft('')
      setMessages((current) => merge(current, [body.message]))
    }
  }

  // Le joueur s'assoit à la première place, les autres présents autour de lui.
  const seated = [
    ...players.filter((player) => player.id === userId),
    ...players.filter((player) => player.id !== userId),
  ].slice(0, SEATS.length)
  /** Dernier message d'un joueur, affiché dans sa bulle. */
  const lastWords = (id: string) => messages.findLast((message) => message.authorId === id)?.body
  // Sans choix du joueur, la bulle va à l'auteur du dernier message, s'il est présent.
  const speaking = speaker ?? messages.at(-1)?.authorId ?? null

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>
          <Entity kind="tavern" /> Taverne
        </h1>
        <span className="status" data-status={status}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <Scene
        label="Salle de la taverne"
        art="art-tav"
        backdrop={<TavernBackdrop />}
        overlay={
          <div className="tavern-panels">
            <section className="panel" aria-label="Messages">
              {messages.length === 0 && <p className="muted">Aucun message pour le moment.</p>}
              <ul className="messages">
                {messages.map((message) => (
                  <li key={message.id} data-mine={message.authorId === userId || undefined}>
                    <span className="muted">{timeOf(message.postedAt)}</span>{' '}
                    <strong>{message.authorName}</strong> {message.body}
                  </li>
                ))}
              </ul>
              <form className="row" onSubmit={send}>
                <input
                  aria-label="Votre message"
                  value={draft}
                  maxLength={MESSAGE_MAX_LENGTH * 2}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Votre message"
                  style={{ flex: 1 }}
                />
                <button type="submit">Envoyer</button>
              </form>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </section>

            <section className="panel" aria-label="Joueurs présents">
              <h2>Présents</h2>
              <ul className="presence">
                {players.map((player) => (
                  <li key={player.id}>{player.name}</li>
                ))}
              </ul>
            </section>
          </div>
        }
      >
        {seated.map((player, index) => {
          const seat = SEATS[index]
          const quote = lastWords(player.id)
          return (
            <button
              key={player.id}
              type="button"
              className="seat"
              aria-pressed={speaking === player.id}
              aria-label={player.name}
              style={at(seat.left, seat.top)}
              onClick={() => {
                setSpeaker(player.id)
                firePet(player.id)
              }}
            >
              {speaking === player.id && quote && <span className="bubble">{quote}</span>}
              <span
                className={petted?.value === player.id ? 'hop' : undefined}
                key={petted?.value === player.id ? petted.n : 0}
              >
                <CatAvatar
                  {...lookOf(player.id)}
                  size={seat.size}
                  flip={seat.flip}
                  helmet={player.id === userId}
                  armor={false}
                  weapon={false}
                  label=""
                />
              </span>
              <span className="tag" data-mine={player.id === userId || undefined}>
                {player.name}
              </span>
              {petted?.value === player.id && (
                <Hearts key={`hearts-${petted.n}`} left="50%" top="20%" />
              )}
            </button>
          )
        })}
      </Scene>
    </>
  )
}
