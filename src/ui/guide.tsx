'use client'
import Link from 'next/link'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { GiOpenBook } from 'react-icons/gi'
import { Entity } from './entity'

/** Une page du guide : l'entité qui l'illustre, un titre, un texte et un lien éventuel. */
interface GuidePage {
  kind: string
  title: string
  body: ReactNode
  link?: { href: string; label: string }
}

/**
 * Contenu du guide du jeu. Il ne décrit que ce que voit le joueur : aucun module n'est importé,
 * pour que le guide reste une simple page d'interface partagée (règle 4, et src/ui ne dépend
 * d'aucun module). Une nouvelle fonctionnalité du jeu y reçoit sa page.
 */
const PAGES: GuidePage[] = [
  {
    kind: 'hero',
    title: 'Bienvenue à Royaumes',
    body: (
      <>
        <p>
          Vous êtes le seigneur d'un petit royaume peuplé de chats. Faites prospérer votre village,
          équipez votre chat chevalier, explorez le donjon avec d'autres joueurs et grimpez au
          classement.
        </p>
        <p className="muted">
          Ce guide se feuillette avec les boutons du bas. Vous le retrouverez à tout moment avec le
          bouton « Guide » de la barre de navigation.
        </p>
      </>
    ),
  },
  {
    kind: 'village',
    title: 'Le Village et ses ressources',
    body: (
      <>
        <p>
          Votre village produit trois ressources : le <Entity kind="wood" showLabel />, le{' '}
          <Entity kind="stone" showLabel /> et l'
          <Entity kind="gold" showLabel />. La production continue même quand vous n'êtes pas
          connecté : elle est calculée à partir du temps écoulé.
        </p>
        <p>
          Chaque ressource vient d'un bâtiment : le <Entity kind="sawmill" showLabel />, la{' '}
          <Entity kind="quarry" showLabel /> et le <Entity kind="mine" showLabel />, qu'il faut
          d'abord construire. Cliquez sur un bâtiment de la carte pour l'améliorer : chaque niveau
          augmente sa production, et coûte un peu plus cher que le précédent (niveau 10 au plus).
        </p>
      </>
    ),
    link: { href: '/village', label: 'Voir mon village' },
  },
  {
    kind: 'village',
    title: 'Mon chat, au château',
    body: (
      <>
        <p>
          Cliquez sur le château de votre village pour composer l'allure de votre chat : chat
          chevalier ou chaton écuyer, couleur du pelage et du regard.
        </p>
        <p>
          C'est lui qui vous représente partout : les autres joueurs le voient à la Taverne et dans
          le Donjon, avec l'équipement qu'il porte.
        </p>
      </>
    ),
    link: { href: '/avatar', label: 'Personnaliser mon chat' },
  },
  {
    kind: 'forge',
    title: 'La Forge',
    body: (
      <>
        <p>
          Choisissez une recette : son coût est prélevé dans les ressources de votre village, puis
          l'objet chauffe sur l'enclume pendant quelques minutes. Une fois prêt, retirez-le : il
          rejoint votre inventaire. Si vous annulez une fabrication, le village est remboursé.
        </p>
        <p>
          Dans l'inventaire, équipez ou ôtez vos objets (un casque, une armure, une arme, une cape)
          et gravez-y un nom. Améliorer la forge fait forger des objets de meilleure qualité, aux
          bonus plus élevés.
        </p>
      </>
    ),
    link: { href: '/forge', label: 'Aller à la forge' },
  },
  {
    kind: 'dungeon',
    title: 'Le Donjon',
    body: (
      <>
        <p>
          Créez une expédition ou rejoignez celle d'un autre joueur (quatre chats au plus), ou
          partez seul avec des chatons écuyers. Le donjon compte six salles : salles vides, trésors,
          ou monstres (<Entity kind="goblin" showLabel />, <Entity kind="skeleton" showLabel />
          ). La dernière abrite <Entity kind="troll" showLabel />.
        </p>
        <p>
          Les combats se jouent par manches : tous les héros choisissent en même temps d'attaquer,
          de se défendre ou de soigner. Une manche se termine quand chacun a choisi, ou au bout de
          30 secondes.
        </p>
      </>
    ),
    link: { href: '/dungeon', label: 'Entrer dans le donjon' },
  },
  {
    kind: 'market',
    title: 'Le Marché',
    body: (
      <p>
        Échangez vos ressources avec les autres joueurs : ouvrez votre étal en indiquant ce que vous
        cédez et ce que vous demandez. Les ressources proposées sont mises de côté pendant que
        l'offre est ouverte (24 heures au plus) ; vous pouvez la retirer et les récupérer. Acceptez
        les offres des autres joueurs si votre village peut payer.
      </p>
    ),
    link: { href: '/market', label: 'Aller au marché' },
  },
  {
    kind: 'tavern',
    title: 'La Taverne',
    body: (
      <p>
        Retrouvez les joueurs connectés autour des tables et discutez avec eux. Les messages sont
        limités à 280 caractères et conservés trente jours. Votre chat y est assis avec son
        équipement : caressez celui des autres d'un clic !
      </p>
    ),
    link: { href: '/tavern', label: 'Entrer dans la taverne' },
  },
  {
    kind: 'ranking',
    title: 'Le Classement',
    body: (
      <p>
        Les joueurs sont classés selon leurs victoires au Donjon, puis selon l'herbe à chat
        rapportée des expéditions et les améliorations de leur village. Le classement se met à jour
        en temps réel.
      </p>
    ),
    link: { href: '/ranking', label: 'Voir le classement' },
  },
  {
    kind: 'help',
    title: 'Vos réglages et vos données',
    body: (
      <>
        <p>
          Le bouton de thème alterne entre le thème de votre système, le crépuscule et la nuit. La
          page « Mes données » vous permet de télécharger toutes vos données, ou de supprimer votre
          compte.
        </p>
        <p className="muted">
          Icônes : Game-icons.net (Lorc, Delapouite et contributeurs), licence CC BY 3.0.
        </p>
      </>
    ),
    link: { href: '/account', label: 'Mes données' },
  },
]

/** Clé du stockage local qui retient que le joueur a déjà vu le guide, sur ce navigateur. */
const SEEN_KEY = 'royaumes:guide-vu'

/**
 * Vrai si le guide a déjà été vu ; vrai aussi si le stockage est inaccessible, pour ne pas
 * rouvrir le guide à chaque page (navigation privée, stockage bloqué).
 */
function alreadySeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== null
  } catch {
    return true
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Préférence de confort : sans stockage, le guide reste simplement disponible au clic.
  }
}

/**
 * Bouton « Guide » et fenêtre du guide du jeu. La fenêtre s'ouvre d'elle-même à la première
 * visite. Elle utilise l'élément dialog du navigateur, qui gère le focus, la touche Échap et le
 * fond inerte : rien de tout cela n'est à réécrire.
 */
export function Guide() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [page, setPage] = useState(0)

  function open() {
    setPage(0)
    dialog.current?.showModal()
  }

  // Première visite : le stockage n'est lisible qu'une fois la page chargée dans le navigateur.
  useEffect(() => {
    if (!alreadySeen()) dialog.current?.showModal()
  }, [])

  const close = () => dialog.current?.close()
  const current = PAGES[page]
  const last = page === PAGES.length - 1

  return (
    <>
      <button className="link guide-button" type="button" onClick={open}>
        <GiOpenBook className="icon" aria-hidden="true" focusable="false" /> Guide
      </button>
      <dialog ref={dialog} className="guide panel" aria-labelledby="guide-title" onClose={markSeen}>
        <p className="kicker">
          Guide du jeu - {page + 1} / {PAGES.length}
        </p>
        <h2 id="guide-title">
          <Entity kind={current.kind} /> {current.title}
        </h2>
        <div className="guide-body">{current.body}</div>
        {current.link && (
          <Link className="button" href={current.link.href} onClick={close}>
            {current.link.label}
          </Link>
        )}
        <div className="guide-dots" aria-hidden="true">
          {PAGES.map((p, i) => (
            <span key={p.title} data-current={i === page || undefined} />
          ))}
        </div>
        <div className="row guide-actions">
          <button type="button" className="secondary" onClick={close}>
            Fermer
          </button>
          <span className="row">
            <button
              type="button"
              className="secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </button>
            {last ? (
              <button type="button" onClick={close}>
                À vous de jouer !
              </button>
            ) : (
              <button type="button" onClick={() => setPage(page + 1)}>
                Suivant
              </button>
            )}
          </span>
        </div>
      </dialog>
    </>
  )
}
