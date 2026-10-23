/*
 * Décor dessiné en SVG (thème « royaume des chats »). Fichier produit à partir de l'aperçu
 * validé : formes et dégradés seulement, aucune logique. Les couleurs qui changent entre le
 * jour et la nuit sont des variables CSS (--art-…), définies dans app/art.css : le décor suit
 * le thème sans être rendu de nouveau. Les animations sont des classes CSS, coupées par
 * prefers-reduced-motion.
 */

/** Niveaux des trois bâtiments, lus dans la vue du Village. */
export interface MapLevels {
  sawmill: number
  quarry: number
  mine: number
}

/**
 * Carte du royaume. Chaque bâtiment grandit avec son niveau (sur 10) : voiles du bateau,
 * bidons de la ferme, plants du jardin. Le bâtiment indiqué par « pop » rebondit, pour
 * saluer une amélioration ; « popTick » relance l'animation à chaque amélioration.
 */
export function VillageBackdrop({
  levels,
  pop = null,
  popTick = 0,
}: {
  levels: MapLevels
  pop?: string | null
  popTick?: number
}) {
  const on = (visible: boolean) => (visible ? 'inline' : 'none')
  const lv = {
    sail2: on(levels.sawmill >= 3),
    sail3: on(levels.sawmill >= 6),
    can1: on(levels.quarry >= 1),
    can2: on(levels.quarry >= 4),
    can3: on(levels.quarry >= 7),
    p1: on(levels.mine >= 1),
    p2: on(levels.mine >= 2),
    p3: on(levels.mine >= 4),
    p4: on(levels.mine >= 6),
    p5: on(levels.mine >= 8),
    p6: on(levels.mine >= 10),
  }
  const bounce = (id: string) => (pop === id ? `art-pop${popTick % 2}` : undefined)
  const popClass = {
    castle: bounce('castle'),
    sawmill: bounce('sawmill'),
    quarry: bounce('quarry'),
    mine: bounce('mine'),
  }
  return (
    <svg
      viewBox="0 0 1640 720"
      width="100%"
      className="art-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="m-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-cloudLight)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-cloud)' }} />
        </linearGradient>
        <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-sky1)' }} />
          <stop offset="70%" style={{ stopColor: 'var(--art-map-sky2)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-sky3)' }} />
        </linearGradient>
        <radialGradient id="m-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopOpacity="0.85" style={{ stopColor: 'var(--art-map-orb)' }} />
          <stop offset="100%" stopOpacity="0" style={{ stopColor: 'var(--art-map-orb)' }} />
        </radialGradient>
        <radialGradient id="m-orbcore" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-orbCore)' }} />
        </radialGradient>
        <linearGradient id="m-mt1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-mtFarTop)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-mtFar)' }} />
        </linearGradient>
        <linearGradient id="m-mt2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-mtMidTop)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-mtMid)' }} />
        </linearGradient>
        <linearGradient id="m-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-hillTop)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-hill)' }} />
        </linearGradient>
        <linearGradient id="m-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-landTop)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-land)' }} />
        </linearGradient>
        <linearGradient id="m-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-waterTop)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-water)' }} />
        </linearGradient>
        <linearGradient id="m-refl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopOpacity="0.75" style={{ stopColor: 'var(--art-map-orb)' }} />
          <stop offset="100%" stopOpacity="0" style={{ stopColor: 'var(--art-map-orb)' }} />
        </linearGradient>
        <linearGradient id="m-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-stoneLight)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-stone)' }} />
        </linearGradient>
        <linearGradient id="m-stoneSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-stone)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-stoneDark)' }} />
        </linearGradient>
        <linearGradient id="m-roof" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a2436" />
          <stop offset="55%" stopColor="#5e1424" />
          <stop offset="100%" stopColor="#2e0812" />
        </linearGradient>
        <linearGradient id="m-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a5a36" />
          <stop offset="100%" stopColor="#4a2c18" />
        </linearGradient>
        <linearGradient id="m-barn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a8362a" />
          <stop offset="100%" stopColor="#5a1812" />
        </linearGradient>
        <linearGradient id="m-plaster" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#efe2c4" />
          <stop offset="100%" stopColor="#a8977a" />
        </linearGradient>
        <linearGradient id="m-crypt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a3c5e" />
          <stop offset="100%" stopColor="#1a1424" />
        </linearGradient>
        <linearGradient id="m-pine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-pineLight)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-pine)' }} />
        </linearGradient>
        <radialGradient id="m-leaf" cx="35%" cy="30%" r="75%">
          <stop offset="0%" style={{ stopColor: 'var(--art-map-leafLight)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-map-leaf)' }} />
        </radialGradient>
        <radialGradient id="m-catnip" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9ef08a" />
          <stop offset="100%" stopColor="#2f7a3a" />
        </radialGradient>
        <linearGradient id="m-sail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6ecd6" />
          <stop offset="100%" stopColor="#b9a988" />
        </linearGradient>
        <linearGradient id="m-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e6e6ee" />
          <stop offset="100%" stopColor="#7a7a88" />
        </linearGradient>
        <radialGradient id="m-arcane" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9b6bff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#9b6bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb84d" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m-vignette" cx="40%" cy="50%" r="78%">
          <stop offset="58%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" style={{ stopOpacity: 'var(--art-map-vignette)' }} />
        </radialGradient>
        <pattern id="m-tiles" width="12" height="9" patternUnits="userSpaceOnUse">
          <path
            d="M0 9 Q 3 4 6 9 Q 9 4 12 9"
            fill="none"
            stroke="#000"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
        </pattern>
        <pattern id="m-bricks" width="22" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M0 0.5 H22 M0 6.5 H22 M6 0.5 V6.5 M17 6.5 V12"
            fill="none"
            stroke="#000"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />
        </pattern>
        <pattern id="m-planks" width="10" height="40" patternUnits="userSpaceOnUse">
          <path d="M0.5 0 V40" stroke="#000" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="5" cy="12" r="0.9" fill="#000" fillOpacity="0.3" />
        </pattern>
        <pattern id="m-grass" width="18" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M3 12 l 1 -5 M7 12 l -1 -4 M12 12 l 1.5 -6 M15 12 l -1 -3"
            strokeWidth="1.1"
            strokeLinecap="round"
            style={{ stroke: 'var(--art-map-grassLine)' }}
          />
        </pattern>
        <filter id="m-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="m-blur2" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id="m-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
          />
        </filter>
      </defs>

      {/* Ciel */}
      <rect width="1640" height="720" fill="url(#m-sky)" />
      <g fill="#fff" style={{ opacity: 'var(--art-map-stars)' }}>
        <circle className="twinkle" cx="80" cy="40" r="1.6" />
        <circle cx="210" cy="90" r="1.1" />
        <circle className="twinkle" cx="340" cy="30" r="1.8" style={{ animationDelay: '1s' }} />
        <circle cx="460" cy="70" r="1" />
        <circle className="twinkle" cx="560" cy="24" r="1.5" style={{ animationDelay: '2s' }} />
        <circle cx="700" cy="60" r="1.2" />
        <circle className="twinkle" cx="820" cy="28" r="1.7" />
        <circle cx="1110" cy="50" r="1.3" />
        <circle className="twinkle" cx="1260" cy="34" r="1.6" style={{ animationDelay: '1.5s' }} />
        <circle cx="1400" cy="80" r="1.1" />
        <circle cx="1530" cy="40" r="1.5" />
        <circle cx="30" cy="140" r="1.2" />
        <circle cx="650" cy="120" r="1" />
        <circle cx="1180" cy="120" r="1.2" />
      </g>
      <g style={{ transform: 'translateX(var(--art-map-orbx))' }}>
        <circle cx="0" cy="112" r="150" fill="url(#m-orb)" />
        <circle cx="0" cy="112" r="40" fill="url(#m-orbcore)" />
        <g fill="#b8c0dc" style={{ opacity: 'var(--art-map-craters)' }}>
          <circle cx="-12" cy="104" r="7" />
          <circle cx="14" cy="122" r="5" />
          <circle cx="6" cy="96" r="3.5" />
        </g>
      </g>
      <g style={{ opacity: 'var(--art-map-cloudOpacity)' }}>
        <g transform="translate(0 70) scale(1.53)">
          <g className="cloud" style={{ animationDuration: '110s', animationDelay: '-20s' }}>
            <g opacity="0.95">
              <path
                d="M0 44 C -14 44, -16 24, 4 20 C 0 2, 26 -8, 42 6 C 50 -16, 90 -18, 100 2 C 112 -10, 140 -4, 138 18 C 158 14, 166 44, 144 44 Z"
                fill="url(#m-cloud)"
              />
              <path
                d="M10 24 C 14 12, 30 8, 40 14 M54 4 C 64 -6, 84 -6, 92 6 M108 8 C 118 2, 130 6, 132 16"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
                style={{ stroke: 'var(--art-map-cloudLight)' }}
              />
              <path d="M4 44 H 140" stroke="#000" strokeOpacity="0.12" strokeWidth="4" />
            </g>
          </g>
        </g>
        <g transform="translate(0 130) scale(1.02)">
          <g className="cloud" style={{ animationDuration: '80s', animationDelay: '-50s' }}>
            <g opacity="0.85">
              <path
                d="M0 44 C -14 44, -16 24, 4 20 C 0 2, 26 -8, 42 6 C 50 -16, 90 -18, 100 2 C 112 -10, 140 -4, 138 18 C 158 14, 166 44, 144 44 Z"
                fill="url(#m-cloud)"
              />
              <path
                d="M10 24 C 14 12, 30 8, 40 14 M54 4 C 64 -6, 84 -6, 92 6 M108 8 C 118 2, 130 6, 132 16"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
                style={{ stroke: 'var(--art-map-cloudLight)' }}
              />
              <path d="M4 44 H 140" stroke="#000" strokeOpacity="0.12" strokeWidth="4" />
            </g>
          </g>
        </g>
        <g transform="translate(0 40) scale(2.04)">
          <g className="cloud" style={{ animationDuration: '140s', animationDelay: '-95s' }}>
            <g opacity="0.9">
              <path
                d="M0 44 C -14 44, -16 24, 4 20 C 0 2, 26 -8, 42 6 C 50 -16, 90 -18, 100 2 C 112 -10, 140 -4, 138 18 C 158 14, 166 44, 144 44 Z"
                fill="url(#m-cloud)"
              />
              <path
                d="M10 24 C 14 12, 30 8, 40 14 M54 4 C 64 -6, 84 -6, 92 6 M108 8 C 118 2, 130 6, 132 16"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
                style={{ stroke: 'var(--art-map-cloudLight)' }}
              />
              <path d="M4 44 H 140" stroke="#000" strokeOpacity="0.12" strokeWidth="4" />
            </g>
          </g>
        </g>
        <g transform="translate(0 170) scale(0.85)">
          <g className="cloud" style={{ animationDuration: '70s', animationDelay: '-10s' }}>
            <g opacity="0.8">
              <path
                d="M0 44 C -14 44, -16 24, 4 20 C 0 2, 26 -8, 42 6 C 50 -16, 90 -18, 100 2 C 112 -10, 140 -4, 138 18 C 158 14, 166 44, 144 44 Z"
                fill="url(#m-cloud)"
              />
              <path
                d="M10 24 C 14 12, 30 8, 40 14 M54 4 C 64 -6, 84 -6, 92 6 M108 8 C 118 2, 130 6, 132 16"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
                style={{ stroke: 'var(--art-map-cloudLight)' }}
              />
              <path d="M4 44 H 140" stroke="#000" strokeOpacity="0.12" strokeWidth="4" />
            </g>
          </g>
        </g>
        <g transform="translate(0 95) scale(1.27)">
          <g className="cloud" style={{ animationDuration: '95s', animationDelay: '-70s' }}>
            <g opacity="0.9">
              <path
                d="M0 44 C -14 44, -16 24, 4 20 C 0 2, 26 -8, 42 6 C 50 -16, 90 -18, 100 2 C 112 -10, 140 -4, 138 18 C 158 14, 166 44, 144 44 Z"
                fill="url(#m-cloud)"
              />
              <path
                d="M10 24 C 14 12, 30 8, 40 14 M54 4 C 64 -6, 84 -6, 92 6 M108 8 C 118 2, 130 6, 132 16"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
                style={{ stroke: 'var(--art-map-cloudLight)' }}
              />
              <path d="M4 44 H 140" stroke="#000" strokeOpacity="0.12" strokeWidth="4" />
            </g>
          </g>
        </g>
      </g>
      <g className="shoot" style={{ opacity: 'var(--art-map-stars)' }}>
        <path d="M1180 40 L 1240 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M1180 40 L 1290 -8" stroke="#cfd8ff" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Montagnes en trois plans */}
      <path
        d="M0 262 L 40 214 L 70 226 L 112 160 L 140 176 L 176 132 L 214 190 L 250 168 L 300 214 L 340 180 L 392 230 L 450 196 L 520 240 L 600 206 L 660 238 L 720 168 L 760 186 L 812 120 L 850 150 L 900 96 L 950 146 L 990 128 L 1040 178 L 1100 134 L 1150 160 L 1200 108 L 1260 152 L 1320 118 L 1380 170 L 1440 126 L 1500 160 L 1560 120 L 1640 168 L 1640 300 L 0 300 Z"
        fill="url(#m-mt1)"
      />
      <path
        d="M0 290 L 60 250 L 120 266 L 190 222 L 260 256 L 330 230 L 400 268 L 480 238 L 560 270 L 640 246 L 720 272 L 800 236 L 880 262 L 960 226 L 1040 258 L 1120 232 L 1200 262 L 1290 226 L 1380 256 L 1470 232 L 1560 258 L 1640 236 L 1640 320 L 0 320 Z"
        fill="url(#m-mt2)"
      />
      <path
        d="M0 300 C 160 270, 300 300, 460 284 C 620 268, 760 300, 940 278 C 1120 256, 1300 296, 1460 274 C 1540 264, 1600 270, 1640 268 L 1640 360 L 0 360 Z"
        fill="url(#m-hill)"
      />

      {/* Hameau lointain et moulin à vent */}
      <g opacity="0.9" style={{ fill: 'var(--art-map-mtMid)' }}>
        <path d="M120 300 v -16 l 10 -8 l 10 8 v 16 z M146 300 v -12 l 8 -7 l 8 7 v 12 z M168 300 v -18 l 11 -9 l 11 9 v 18 z" />
        <path d="M1250 290 v -14 l 9 -8 l 9 8 v 14 z M1272 290 v -18 l 11 -9 l 11 9 v 18 z" />
      </g>
      <g
        className="flicker"
        style={{ fill: 'var(--art-map-window)', opacity: 'var(--art-map-windows)' }}
      >
        <rect x="127" y="290" width="4" height="4" />
        <rect x="176" y="289" width="4" height="5" />
        <rect x="1281" y="279" width="4" height="5" />
      </g>
      <g transform="translate(780 262)">
        <path
          d="M-9 30 L -6 -6 L 6 -6 L 9 30 Z"
          strokeWidth="1.5"
          style={{ fill: 'var(--art-map-mtMid)', stroke: 'var(--art-map-mtFar)' }}
        />
        <path d="M-8 -6 L 0 -14 L 8 -6 Z" style={{ fill: 'var(--art-map-mtFar)' }} />
        <g
          className="blades"
          strokeWidth="1"
          style={{ fill: 'var(--art-map-mtFarTop)', stroke: 'var(--art-map-mtFar)' }}
        >
          <path d="M0 -8 L -3 -36 L 3 -36 Z" />
          <path d="M0 -8 L 28 -11 L 28 -5 Z" />
          <path d="M0 -8 L 3 20 L -3 20 Z" />
          <path d="M0 -8 L -28 -5 L -28 -11 Z" />
          <circle cx="0" cy="-8" r="2.5" />
        </g>
      </g>

      {/* Terres, herbe et collines */}
      <path
        d="M0 330 C 200 300, 420 336, 640 314 C 860 292, 1060 330, 1280 306 C 1440 290, 1560 300, 1640 296 L 1640 720 L 0 720 Z"
        fill="url(#m-land)"
      />
      <path
        d="M0 330 C 200 300, 420 336, 640 314 C 860 292, 1060 330, 1280 306 C 1440 290, 1560 300, 1640 296 L 1640 720 L 0 720 Z"
        fill="url(#m-grass)"
        opacity="0.6"
      />
      <path
        d="M0 540 C 180 500, 300 570, 460 552 C 600 536, 660 640, 820 628 C 980 616, 1100 690, 1300 660 C 1440 640, 1560 670, 1640 664 L 1640 720 L 0 720 Z"
        opacity="0.7"
        style={{ fill: 'var(--art-map-landShade)' }}
      />
      <g opacity="0.45" style={{ fill: 'var(--art-map-landShade)' }}>
        <ellipse cx="180" cy="330" rx="140" ry="18" />
        <ellipse cx="1010" cy="470" rx="170" ry="24" />
        <ellipse cx="760" cy="560" rx="120" ry="14" />
      </g>

      {/* Rivière et lac */}
      <path
        d="M1060 296 C 990 340, 910 346, 870 404 C 832 468, 712 474, 572 504 C 432 532, 366 562, 306 602"
        fill="none"
        strokeWidth="40"
        strokeLinecap="round"
        style={{ stroke: 'var(--art-map-bank)' }}
      />
      <path
        d="M1060 296 C 990 340, 910 346, 870 404 C 832 468, 712 474, 572 504 C 432 532, 366 562, 306 602"
        fill="none"
        stroke="url(#m-water)"
        strokeWidth="28"
        strokeLinecap="round"
      />
      <path
        className="water"
        d="M1060 296 C 990 340, 910 346, 870 404 C 832 468, 712 474, 572 504 C 432 532, 366 562, 306 602"
        fill="none"
        strokeWidth="2.5"
        strokeDasharray="16 44"
        strokeLinecap="round"
        style={{ stroke: 'var(--art-map-waterHi)' }}
      />
      <path
        d="M20 612 C 30 560, 140 540, 230 548 C 340 556, 420 590, 404 640 C 390 690, 240 704, 130 694 C 50 686, 12 656, 20 612 Z"
        style={{ fill: 'var(--art-map-bank)' }}
      />
      <path
        d="M32 612 C 42 568, 144 552, 228 560 C 330 568, 404 596, 392 638 C 378 682, 240 692, 134 684 C 60 676, 26 650, 32 612 Z"
        fill="url(#m-water)"
      />
      <path d="M196 566 L 244 566 L 290 684 L 150 684 Z" fill="url(#m-refl)" opacity="0.6" />
      <g
        className="water"
        fill="none"
        strokeWidth="2"
        strokeDasharray="10 40"
        strokeLinecap="round"
        style={{ stroke: 'var(--art-map-waterHi)' }}
      >
        <path d="M70 600 Q 200 590 330 606" />
        <path d="M90 640 Q 220 630 360 646" />
        <path d="M120 670 Q 230 664 330 674" />
      </g>
      <g fill="#2e5a2a" stroke="#183a16" strokeWidth="1">
        <path d="M90 660 a 12 6 0 1 1 0.1 0 l -6 -2 z" />
        <path d="M330 620 a 10 5 0 1 1 0.1 0 z" />
        <path d="M350 660 a 13 6 0 1 1 0.1 0 z" />
      </g>
      <g fill="#ff9ac0">
        <circle cx="352" cy="656" r="3" />
        <circle cx="92" cy="656" r="2.5" />
      </g>
      <g fill="none" strokeWidth="1.5" opacity="0.7" style={{ stroke: 'var(--art-map-waterHi)' }}>
        <ellipse className="ripple" cx="140" cy="620" rx="22" ry="6" />
        <ellipse
          className="ripple"
          cx="300"
          cy="660"
          rx="18"
          ry="5"
          style={{ animationDelay: '1.4s' }}
        />
        <ellipse
          className="ripple"
          cx="210"
          cy="590"
          rx="16"
          ry="4"
          style={{ animationDelay: '2.2s' }}
        />
      </g>
      <g className="jump">
        <path
          d="M110 640 c 6 -6 16 -6 20 0 l 6 -4 l 0 8 l -6 -4 c -4 6 -14 6 -20 0 z"
          fill="#8ab0d0"
          stroke="#1a2a36"
          strokeWidth="1.2"
        />
      </g>
      <g className="jump" style={{ animationDelay: '-3s' }}>
        <path
          d="M270 610 c 5 -5 13 -5 16 0 l 5 -3 l 0 6 l -5 -3 c -3 5 -11 5 -16 0 z"
          fill="#d0a060"
          stroke="#3a2010"
          strokeWidth="1.2"
        />
      </g>
      <g
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        style={{ stroke: 'var(--art-map-reed)' }}
      >
        <path d="M392 626 q 4 -26 -2 -44 M400 630 q 6 -22 4 -40 M386 634 q -2 -20 -8 -32" />
        <path d="M40 600 q -4 -24 2 -40 M48 596 q 2 -20 8 -32" />
      </g>
      <g fill="#5a3a24">
        <ellipse cx="398" cy="582" rx="3" ry="8" />
        <ellipse cx="404" cy="590" rx="3" ry="8" />
        <ellipse cx="42" cy="560" rx="3" ry="8" />
      </g>

      {/* Chemins de terre bordés de pierres */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M600 420 C 520 460, 470 520, 470 590 M600 420 C 470 400, 380 386, 300 390 M600 420 C 700 430, 760 414, 820 404 M820 404 C 860 460, 872 500, 884 540 M650 330 C 770 286, 880 270, 990 262"
          strokeWidth="20"
          style={{ stroke: 'var(--art-map-pathEdge)' }}
        />
        <path
          d="M600 420 C 520 460, 470 520, 470 590 M600 420 C 470 400, 380 386, 300 390 M600 420 C 700 430, 760 414, 820 404 M820 404 C 860 460, 872 500, 884 540 M650 330 C 770 286, 880 270, 990 262"
          strokeWidth="13"
          style={{ stroke: 'var(--art-map-path)' }}
        />
        <path
          d="M600 420 C 520 460, 470 520, 470 590 M600 420 C 470 400, 380 386, 300 390 M600 420 C 700 430, 760 414, 820 404 M820 404 C 860 460, 872 500, 884 540 M650 330 C 770 286, 880 270, 990 262"
          strokeWidth="3"
          strokeDasharray="2 18"
          opacity="0.8"
          style={{ stroke: 'var(--art-map-pathLight)' }}
        />
      </g>

      {/* Pont de bois, rochers, fleurs et touffes d'herbe */}
      <g transform="translate(858 438) rotate(-28)">
        <path
          d="M-34 -10 Q 0 -22 34 -10 L 34 10 Q 0 -2 -34 10 Z"
          fill="url(#m-wood)"
          stroke="#1a0e08"
          strokeWidth="2"
        />
        <path
          d="M-26 -14 V 8 M-14 -17 V 4 M-2 -18 V 2 M10 -17 V 4 M22 -14 V 8"
          stroke="#2a1608"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <path
          d="M-34 -10 Q 0 -30 34 -10 M-34 -24 V -8 M0 -32 V -18 M34 -24 V -8"
          stroke="#5a3a20"
          strokeWidth="3"
          fill="none"
        />
      </g>
      <g fill="url(#m-stone)" stroke="#141018" strokeWidth="1.5">
        <path d="M420 420 q 8 -14 22 -8 q 10 6 4 14 z" />
        <path d="M760 450 q 6 -10 16 -6 q 8 4 2 10 z" />
        <path d="M1000 560 q 10 -16 26 -8 q 10 8 2 14 z" />
        <path d="M640 540 q 6 -10 14 -6 q 6 4 2 8 z" />
        <path d="M300 470 q 8 -12 20 -6 q 8 6 2 10 z" />
      </g>
      <g>
        <g fill="#e8d84a">
          <circle cx="330" cy="460" r="2.5" />
          <circle cx="352" cy="472" r="2" />
          <circle cx="740" cy="520" r="2.5" />
          <circle cx="1010" cy="500" r="2" />
          <circle cx="560" cy="560" r="2" />
        </g>
        <g fill="#e86a8a">
          <circle cx="342" cy="466" r="2" />
          <circle cx="752" cy="528" r="2.5" />
          <circle cx="580" cy="568" r="2.5" />
          <circle cx="1030" cy="508" r="2" />
        </g>
        <g fill="#b8c8ff">
          <circle cx="760" cy="514" r="2" />
          <circle cx="1020" cy="494" r="2.5" />
          <circle cx="420" cy="500" r="2" />
        </g>
      </g>
      <g
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{ stroke: 'var(--art-map-grassLine)' }}
      >
        <path className="grass" d="M200 470 l -2 -14 M204 470 l 2 -18 M208 470 l 5 -12" />
        <path
          className="grass"
          d="M560 470 l -2 -14 M564 470 l 2 -18 M568 470 l 5 -12"
          style={{ animationDelay: '-1s' }}
        />
        <path
          className="grass"
          d="M720 560 l -2 -16 M724 560 l 2 -20 M728 560 l 5 -14"
          style={{ animationDelay: '-2s' }}
        />
        <path
          className="grass"
          d="M1000 610 l -2 -16 M1004 610 l 2 -20 M1008 610 l 5 -14"
          style={{ animationDelay: '-0.5s' }}
        />
        <path
          className="grass"
          d="M440 680 l -2 -16 M444 680 l 2 -20 M448 680 l 5 -14"
          style={{ animationDelay: '-1.6s' }}
        />
        <path
          className="grass"
          d="M640 690 l -2 -16 M644 690 l 2 -20 M648 690 l 5 -14"
          style={{ animationDelay: '-2.4s' }}
        />
        <path
          className="grass"
          d="M100 480 l -2 -14 M104 480 l 2 -18 M108 480 l 5 -12"
          style={{ animationDelay: '-0.8s' }}
        />
      </g>

      {/* Arbres : pins et feuillus */}
      <g>
        <g transform="translate(110 330)">
          <g className="wind" style={{ animationDelay: '-4s' }}>
            <rect x="-4" y="-6" width="8" height="18" fill="#3a2414" />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L -26 6 L -12 -18 L -22 -16 L -9 -42 L -16 -40 Z"
              fill="url(#m-pine)"
            />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L 2 6 Z"
              fill="#000"
              opacity="0.28"
            />
            <path
              d="M-6 -46 l -6 6 M-10 -22 l -8 6 M-14 0 l -8 4"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
              style={{ stroke: 'var(--art-map-pineLight)' }}
            />
          </g>
        </g>
        <g transform="translate(150 316) scale(0.8)">
          <g className="wind" style={{ animationDelay: '-0s' }}>
            <rect x="-4" y="-6" width="8" height="18" fill="#3a2414" />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L -26 6 L -12 -18 L -22 -16 L -9 -42 L -16 -40 Z"
              fill="url(#m-pine)"
            />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L 2 6 Z"
              fill="#000"
              opacity="0.28"
            />
            <path
              d="M-6 -46 l -6 6 M-10 -22 l -8 6 M-14 0 l -8 4"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
              style={{ stroke: 'var(--art-map-pineLight)' }}
            />
          </g>
        </g>
        <g transform="translate(410 330)">
          <g className="wind" style={{ animationDelay: '-4s' }}>
            <rect x="-5" y="-4" width="10" height="26" fill="#3a2414" />
            <circle cx="-14" cy="-18" r="20" fill="url(#m-leaf)" />
            <circle cx="12" cy="-22" r="22" fill="url(#m-leaf)" />
            <circle cx="-2" cy="-40" r="20" fill="url(#m-leaf)" />
            <path
              d="M-30 -10 C -20 2, 20 2, 32 -12 C 26 0, -20 6, -30 -10 Z"
              fill="#000"
              opacity="0.25"
            />
            <g opacity="0.55" style={{ fill: 'var(--art-map-leafLight)' }}>
              <circle cx="-10" cy="-48" r="5" />
              <circle cx="4" cy="-52" r="3.5" />
              <circle cx="-22" cy="-24" r="4" />
              <circle cx="14" cy="-34" r="4.5" />
            </g>
          </g>
        </g>
        <g transform="translate(720 330) scale(0.9)">
          <g className="wind" style={{ animationDelay: '-0s' }}>
            <rect x="-5" y="-4" width="10" height="26" fill="#3a2414" />
            <circle cx="-14" cy="-18" r="20" fill="url(#m-leaf)" />
            <circle cx="12" cy="-22" r="22" fill="url(#m-leaf)" />
            <circle cx="-2" cy="-40" r="20" fill="url(#m-leaf)" />
            <path
              d="M-30 -10 C -20 2, 20 2, 32 -12 C 26 0, -20 6, -30 -10 Z"
              fill="#000"
              opacity="0.25"
            />
            <g opacity="0.55" style={{ fill: 'var(--art-map-leafLight)' }}>
              <circle cx="-10" cy="-48" r="5" />
              <circle cx="4" cy="-52" r="3.5" />
              <circle cx="-22" cy="-24" r="4" />
              <circle cx="14" cy="-34" r="4.5" />
            </g>
          </g>
        </g>
        <g transform="translate(700 600)">
          <g className="wind" style={{ animationDelay: '-4s' }}>
            <rect x="-5" y="-4" width="10" height="26" fill="#3a2414" />
            <circle cx="-16" cy="-18" r="22" fill="url(#m-leaf)" />
            <circle cx="14" cy="-22" r="24" fill="url(#m-leaf)" />
            <circle cx="-2" cy="-42" r="22" fill="url(#m-leaf)" />
            <path
              d="M-34 -10 C -22 4, 22 4, 36 -12 C 28 2, -22 8, -34 -10 Z"
              fill="#000"
              opacity="0.25"
            />
            <g opacity="0.55" style={{ fill: 'var(--art-map-leafLight)' }}>
              <circle cx="-10" cy="-52" r="5.5" />
              <circle cx="6" cy="-56" r="4" />
              <circle cx="-24" cy="-24" r="4" />
              <circle cx="16" cy="-36" r="5" />
            </g>
          </g>
        </g>
        <g transform="translate(1060 430)">
          <g className="wind" style={{ animationDelay: '-0s' }}>
            <rect x="-4" y="-6" width="8" height="18" fill="#3a2414" />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L -26 6 L -12 -18 L -22 -16 L -9 -42 L -16 -40 Z"
              fill="url(#m-pine)"
            />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L 2 6 Z"
              fill="#000"
              opacity="0.28"
            />
            <path
              d="M-6 -46 l -6 6 M-10 -22 l -8 6 M-14 0 l -8 4"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
              style={{ stroke: 'var(--art-map-pineLight)' }}
            />
          </g>
        </g>
        <g transform="translate(1120 560) scale(1.2)">
          <g className="wind" style={{ animationDelay: '-1s' }}>
            <rect x="-4" y="-6" width="8" height="18" fill="#3a2414" />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L -26 6 L -12 -18 L -22 -16 L -9 -42 L -16 -40 Z"
              fill="url(#m-pine)"
            />
            <path
              d="M0 -70 L 16 -40 L 9 -42 L 22 -16 L 12 -18 L 26 6 L 2 6 Z"
              fill="#000"
              opacity="0.28"
            />
            <path
              d="M-6 -46 l -6 6 M-10 -22 l -8 6 M-14 0 l -8 4"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
              style={{ stroke: 'var(--art-map-pineLight)' }}
            />
          </g>
        </g>
        <g fill="url(#m-pine)" className="wind" style={{ animationDuration: '6s' }}>
          <path d="M1200 450 L 1226 360 L 1252 450 Z" />
          <path d="M1240 480 L 1270 370 L 1300 480 Z" />
          <path d="M1290 430 L 1314 350 L 1338 430 Z" />
          <path d="M1330 500 L 1364 380 L 1398 500 Z" />
          <path d="M1390 450 L 1418 360 L 1446 450 Z" />
          <path d="M1430 520 L 1466 390 L 1502 520 Z" />
          <path d="M1490 460 L 1518 366 L 1546 460 Z" />
          <path d="M1530 530 L 1566 400 L 1602 530 Z" />
          <path d="M1580 470 L 1608 380 L 1636 470 Z" />
          <path d="M1210 600 L 1246 480 L 1282 600 Z" />
          <path d="M1280 640 L 1320 500 L 1360 640 Z" />
          <path d="M1360 610 L 1396 490 L 1432 610 Z" />
          <path d="M1440 660 L 1480 520 L 1520 660 Z" />
          <path d="M1520 630 L 1556 500 L 1592 630 Z" />
        </g>
      </g>

      {/* Crypte du donjon : ruine gothique */}
      <g>
        <circle className="rune" cx="1000" cy="210" r="130" fill="url(#m-arcane)" />
        <ellipse
          cx="1000"
          cy="304"
          rx="110"
          ry="14"
          fill="#000"
          opacity="0.5"
          filter="url(#m-soft)"
        />
        <path
          d="M916 302 L 916 238 L 930 220 L 944 238 L 944 302 Z M1056 302 L 1056 250 L 1068 236 L 1080 250 L 1080 302 Z"
          fill="url(#m-crypt)"
          stroke="#0c0812"
          strokeWidth="2.5"
        />
        <path
          d="M952 302 L 952 172 C 952 150, 968 132, 980 118 L 1000 70 L 1020 118 C 1032 132, 1048 150, 1048 172 L 1048 302 Z"
          fill="url(#m-crypt)"
          stroke="#0c0812"
          strokeWidth="3"
        />
        <path
          d="M952 302 L 952 172 C 952 150, 968 132, 980 118 L 1000 70 L 1020 118 C 1032 132, 1048 150, 1048 172 L 1048 302 Z"
          fill="url(#m-bricks)"
        />
        <path
          d="M1000 70 L 1000 40 M990 50 L 1010 50"
          stroke="#2e2440"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M978 302 L 978 252 C 978 232, 1022 232, 1022 252 L 1022 302 Z" fill="#06040a" />
        <path
          d="M970 200 C 970 180, 990 180, 990 200 L 990 224 L 970 224 Z M1010 200 C 1010 180, 1030 180, 1030 200 L 1030 224 L 1010 224 Z"
          fill="#7b52e0"
          className="rune"
        />
        <circle className="rune" cx="1000" cy="150" r="10" fill="#c9b2ff" />
        <g fill="#3a3346" stroke="#0c0812" strokeWidth="2">
          <path d="M880 316 C 880 300, 900 300, 900 316 L 900 330 L 880 330 Z" />
          <path d="M1090 318 C 1090 304, 1108 304, 1108 318 L 1108 330 L 1090 330 Z" />
          <path d="M1116 326 C 1116 314, 1130 314, 1130 326 L 1130 336 L 1116 336 Z" />
        </g>
        <g className="rune">
          <path
            d="M906 336 q 0 -10 8 -10 q 8 0 8 10 z M928 340 q 0 -7 6 -7 q 6 0 6 7 z M1074 334 q 0 -9 7 -9 q 7 0 7 9 z"
            fill="#7be0ff"
          />
          <path d="M913 336 v 6 M934 340 v 5 M1081 334 v 6" stroke="#d0f4ff" strokeWidth="2.5" />
        </g>
        <path
          d="M1130 300 C 1126 270, 1140 250, 1134 226 M1134 250 L 1150 236 M1132 266 L 1116 254"
          fill="none"
          stroke="#2a2030"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <g className="bats" fill="#0c0812">
          <path d="M960 150 q 6 -6 12 0 q 6 -6 12 0 q -6 2 -12 6 q -6 -4 -12 -6 z" />
          <path d="M1030 120 q 5 -5 10 0 q 5 -5 10 0 q -5 2 -10 5 q -5 -3 -10 -5 z" />
        </g>
      </g>

      {/* Château de Bourg-Ronron */}
      <g className={popClass.castle}>
        <circle
          className="flicker"
          cx="600"
          cy="360"
          r="160"
          fill="url(#m-lamp)"
          style={{ opacity: 'var(--art-map-windows)' }}
        />
        <ellipse
          cx="600"
          cy="436"
          rx="150"
          ry="16"
          fill="#000"
          opacity="0.55"
          filter="url(#m-soft)"
        />
        <path
          d="M520 434 L 520 330 L 534 330 L 534 320 L 548 320 L 548 330 L 562 330 L 562 320 L 576 320 L 576 330 L 590 330 L 590 320 L 604 320 L 604 330 L 618 330 L 618 320 L 632 320 L 632 330 L 646 330 L 646 320 L 660 320 L 660 330 L 680 330 L 680 434 Z"
          fill="url(#m-stone)"
          stroke="#1a1420"
          strokeWidth="2.5"
        />
        <path d="M520 434 L 520 330 L 680 330 L 680 434 Z" fill="url(#m-bricks)" />
        <g>
          <path
            d="M488 436 L 492 300 L 548 300 L 552 436 Z"
            fill="url(#m-stoneSide)"
            stroke="#1a1420"
            strokeWidth="2.5"
          />
          <path d="M488 436 L 492 300 L 548 300 L 552 436 Z" fill="url(#m-bricks)" />
          <path
            d="M484 304 C 494 268, 506 244, 520 214 C 534 244, 546 268, 556 304 Z"
            fill="url(#m-roof)"
            stroke="#1a0810"
            strokeWidth="2.5"
          />
          <path
            d="M484 304 C 494 268, 506 244, 520 214 C 534 244, 546 268, 556 304 Z"
            fill="url(#m-tiles)"
          />
          <path
            d="M648 436 L 652 300 L 708 300 L 712 436 Z"
            fill="url(#m-stoneSide)"
            stroke="#1a1420"
            strokeWidth="2.5"
          />
          <path d="M648 436 L 652 300 L 708 300 L 712 436 Z" fill="url(#m-bricks)" />
          <path
            d="M644 304 C 654 268, 666 244, 680 214 C 694 244, 706 268, 716 304 Z"
            fill="url(#m-roof)"
            stroke="#1a0810"
            strokeWidth="2.5"
          />
          <path
            d="M644 304 C 654 268, 666 244, 680 214 C 694 244, 706 268, 716 304 Z"
            fill="url(#m-tiles)"
          />
        </g>
        <path
          d="M574 336 L 576 236 L 624 236 L 626 336 Z"
          fill="url(#m-stone)"
          stroke="#1a1420"
          strokeWidth="2.5"
        />
        <path d="M574 336 L 576 236 L 624 236 L 626 336 Z" fill="url(#m-bricks)" />
        <path
          d="M566 240 C 578 206, 590 184, 600 156 C 610 184, 622 206, 634 240 Z"
          fill="url(#m-roof)"
          stroke="#1a0810"
          strokeWidth="2.5"
        />
        <path
          d="M566 240 C 578 206, 590 184, 600 156 C 610 184, 622 206, 634 240 Z"
          fill="url(#m-tiles)"
        />
        <path d="M600 156 L 600 124" stroke="#2a2030" strokeWidth="3" />
        <path
          className="flagwave"
          d="M600 126 C 616 122, 628 132, 644 126 L 644 146 C 628 152, 616 142, 600 146 Z"
          fill="#c2263b"
          stroke="#4a0a14"
          strokeWidth="1.5"
        />
        <g fill="#2a5a2a" opacity="0.9">
          <circle cx="524" cy="420" r="5" />
          <circle cx="530" cy="410" r="4" />
          <circle cx="522" cy="400" r="4.5" />
          <circle cx="528" cy="390" r="3.5" />
          <circle cx="676" cy="424" r="5" />
          <circle cx="670" cy="414" r="4" />
          <circle cx="678" cy="404" r="3.5" />
        </g>
        <path
          d="M524 432 C 530 412, 518 398, 528 382 M676 432 C 670 416, 680 404, 672 392"
          fill="none"
          stroke="#1e3a1a"
          strokeWidth="1.5"
        />
        <g fill="#0c0810">
          <rect x="503" y="350" width="4" height="14" rx="2" />
          <rect x="533" y="350" width="4" height="14" rx="2" />
          <rect x="663" y="350" width="4" height="14" rx="2" />
          <rect x="693" y="350" width="4" height="14" rx="2" />
          <rect x="563" y="350" width="4" height="12" rx="2" />
          <rect x="633" y="350" width="4" height="12" rx="2" />
        </g>
        <path d="M520 434 H 680" stroke="#000" strokeOpacity="0.35" strokeWidth="8" />
        <path
          d="M582 436 L 582 392 C 582 370, 618 370, 618 392 L 618 436 Z"
          fill="#1a0f0a"
          stroke="#0c0810"
          strokeWidth="2"
        />
        <path
          d="M588 436 V 390 M596 436 V 382 M604 436 V 382 M612 436 V 390 M584 400 H 616 M584 416 H 616"
          stroke="#6b5a48"
          strokeWidth="2"
        />
        <g fill="#5a1222" stroke="#2a0810" strokeWidth="1.5">
          <path d="M540 340 L 560 340 L 560 380 L 550 374 L 540 380 Z" />
          <path d="M640 340 L 660 340 L 660 380 L 650 374 L 640 380 Z" />
        </g>
        <g fill="#d4a64a">
          <circle cx="550" cy="354" r="3" />
          <circle cx="650" cy="354" r="3" />
        </g>
        <g className="flicker" style={{ fill: 'var(--art-map-window)' }}>
          <path d="M512 330 a 6 6 0 0 1 12 0 v 14 h -12 z" />
          <path d="M672 330 a 6 6 0 0 1 12 0 v 14 h -12 z" />
          <path d="M594 262 a 6 6 0 0 1 12 0 v 16 h -12 z" />
          <path d="M512 376 a 5 5 0 0 1 10 0 v 12 h -10 z" />
          <path d="M676 376 a 5 5 0 0 1 10 0 v 12 h -10 z" />
          <path d="M596 300 a 4 4 0 0 1 8 0 v 12 h -8 z" />
        </g>
      </g>

      {/* Ferme laitière */}
      <g className={popClass.quarry}>
        <ellipse
          cx="300"
          cy="414"
          rx="96"
          ry="12"
          fill="#000"
          opacity="0.5"
          filter="url(#m-soft)"
        />
        <path
          d="M246 412 L 246 352 L 360 352 L 360 412 Z"
          fill="url(#m-barn)"
          stroke="#2a0a08"
          strokeWidth="2.5"
        />
        <path d="M246 412 L 246 352 L 360 352 L 360 412 Z" fill="url(#m-planks)" />
        <path
          d="M238 356 L 256 318 L 303 296 L 350 318 L 368 356 Z"
          fill="#3a2418"
          stroke="#1a0c06"
          strokeWidth="2.5"
        />
        <path d="M238 356 L 256 318 L 303 296 L 350 318 L 368 356 Z" fill="url(#m-tiles)" />
        <path
          d="M286 412 L 286 376 L 320 376 L 320 412 Z"
          fill="#2a1408"
          stroke="#f0e2c4"
          strokeWidth="3"
        />
        <path d="M286 376 L 320 412 M320 376 L 286 412" stroke="#f0e2c4" strokeWidth="2.5" />
        <path
          d="M292 338 l 22 0 l 0 12 l -22 0 z"
          fill="#1a0c06"
          stroke="#f0e2c4"
          strokeWidth="2"
        />
        <g transform="translate(380 392)">
          <path
            d="M0 0 C 0 -10, 26 -10, 26 0 C 30 12, -4 12, 0 0 Z"
            fill="#d9c27a"
            stroke="#6a5420"
            strokeWidth="1.5"
          />
          <path
            d="M4 -2 Q 13 -6 22 -2 M3 4 Q 13 0 24 4"
            stroke="#a88a40"
            strokeWidth="1"
            fill="none"
          />
        </g>
        <g display={lv.can1}>
          <path
            d="M372 412 l 0 -18 q 0 -6 6 -8 l 0 -4 l 6 0 l 0 4 q 6 2 6 8 l 0 18 z"
            fill="url(#m-metal)"
            stroke="#3a3a46"
            strokeWidth="1.5"
          />
        </g>
        <g display={lv.can2}>
          <path
            d="M394 414 l 0 -18 q 0 -6 6 -8 l 0 -4 l 6 0 l 0 4 q 6 2 6 8 l 0 18 z"
            fill="url(#m-metal)"
            stroke="#3a3a46"
            strokeWidth="1.5"
          />
        </g>
        <g display={lv.can3}>
          <path
            d="M416 412 l 0 -18 q 0 -6 6 -8 l 0 -4 l 6 0 l 0 4 q 6 2 6 8 l 0 18 z"
            fill="url(#m-metal)"
            stroke="#3a3a46"
            strokeWidth="1.5"
          />
        </g>
        <g className="graze">
          <path
            d="M190 392 C 190 378, 236 374, 246 386 C 252 396, 244 410, 232 410 L 200 410 C 192 410, 188 402, 190 392 Z"
            fill="#f2ede4"
            stroke="#3a3430"
            strokeWidth="2"
          />
          <path
            d="M206 384 C 212 380, 222 384, 218 392 C 212 396, 204 392, 206 384 Z M232 394 C 238 390, 244 396, 240 402 C 234 404, 230 400, 232 394 Z"
            fill="#2b2633"
          />
          <path
            d="M190 390 C 178 386, 170 392, 172 402 C 174 410, 186 410, 192 404 Z"
            fill="#f2ede4"
            stroke="#3a3430"
            strokeWidth="2"
          />
          <ellipse cx="174" cy="404" rx="6" ry="4" fill="#e8a8b0" />
          <path
            d="M180 386 l -4 -6 M188 386 l 2 -7"
            stroke="#d9cdb4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M200 410 l -1 12 M210 410 l 0 12 M226 410 l 0 12 M236 410 l 1 12"
            stroke="#3a3430"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(270 432)">
          <g className="graze" style={{ animationDuration: '4s' }}>
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#f0e8dc" stroke="#4a3a30" strokeWidth="1" />
            <circle cx="6" cy="-4" r="3" fill="#f0e8dc" stroke="#4a3a30" strokeWidth="1" />
            <path d="M6 -7.5 l 1 -2 l 1.5 2 z" fill="#d03030" />
            <path d="M9 -4 l 2.5 1 l -2.5 1 z" fill="#e0a030" />
          </g>
        </g>
        <g transform="translate(290 438) scale(-0.9 0.9)">
          <g className="graze" style={{ animationDuration: '5s' }}>
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#f0e8dc" stroke="#4a3a30" strokeWidth="1" />
            <circle cx="6" cy="-4" r="3" fill="#f0e8dc" stroke="#4a3a30" strokeWidth="1" />
            <path d="M6 -7.5 l 1 -2 l 1.5 2 z" fill="#d03030" />
            <path d="M9 -4 l 2.5 1 l -2.5 1 z" fill="#e0a030" />
          </g>
        </g>
        <path
          d="M150 424 L 260 424 M150 432 L 260 432 M156 420 V 438 M184 420 V 438 M212 420 V 438 M240 420 V 438"
          stroke="#7a5a3a"
          strokeWidth="2.5"
        />
      </g>

      {/* Jardin d'herbe à chat */}
      <g className={popClass.mine}>
        <ellipse
          cx="895"
          cy="604"
          rx="96"
          ry="12"
          fill="#000"
          opacity="0.45"
          filter="url(#m-soft)"
        />
        <path
          d="M818 600 C 816 560, 818 530, 822 520 L 968 520 C 972 530, 974 560, 972 600 Z"
          fill="#3a2618"
          stroke="#1a0e08"
          strokeWidth="2.5"
        />
        <g fill="#2a1a10" opacity="0.6">
          <circle cx="836" cy="590" r="2" />
          <circle cx="866" cy="574" r="1.6" />
          <circle cx="910" cy="592" r="2" />
          <circle cx="944" cy="568" r="1.6" />
        </g>
        <path
          d="M814 520 C 860 512, 930 512, 976 520"
          fill="none"
          stroke="#8a7458"
          strokeWidth="5"
        />
        <g stroke="#8a7458" strokeWidth="4" strokeLinecap="round">
          <path d="M820 520 v -16 M846 516 v -16 M872 514 v -16 M898 514 v -16 M924 514 v -16 M950 516 v -16 M972 520 v -16" />
        </g>
        <g>
          <g display={lv.p1} className="sway">
            <path
              d="M846 588 C 832 576, 834 556, 846 548 C 858 556, 860 576, 846 588 Z M846 588 C 836 582, 826 570, 830 562 C 840 566, 846 576, 846 588 Z M846 588 C 856 582, 866 570, 862 562 C 852 566, 846 576, 846 588 Z"
              fill="url(#m-catnip)"
              stroke="#1e4a24"
              strokeWidth="1"
            />
          </g>
          <g display={lv.p2} className="sway" style={{ animationDelay: '-1s' }}>
            <path
              d="M876 588 C 862 576, 864 556, 876 548 C 888 556, 890 576, 876 588 Z M876 588 C 866 582, 856 570, 860 562 C 870 566, 876 576, 876 588 Z M876 588 C 886 582, 896 570, 892 562 C 882 566, 876 576, 876 588 Z"
              fill="url(#m-catnip)"
              stroke="#1e4a24"
              strokeWidth="1"
            />
          </g>
          <g display={lv.p3} className="sway" style={{ animationDelay: '-2s' }}>
            <path
              d="M906 588 C 892 576, 894 556, 906 548 C 918 556, 920 576, 906 588 Z M906 588 C 896 582, 886 570, 890 562 C 900 566, 906 576, 906 588 Z M906 588 C 916 582, 926 570, 922 562 C 912 566, 906 576, 906 588 Z"
              fill="url(#m-catnip)"
              stroke="#1e4a24"
              strokeWidth="1"
            />
          </g>
          <g display={lv.p4} className="sway" style={{ animationDelay: '-0.5s' }}>
            <path
              d="M936 588 C 922 576, 924 556, 936 548 C 948 556, 950 576, 936 588 Z M936 588 C 926 582, 916 570, 920 562 C 930 566, 936 576, 936 588 Z M936 588 C 946 582, 956 570, 952 562 C 942 566, 936 576, 936 588 Z"
              fill="url(#m-catnip)"
              stroke="#1e4a24"
              strokeWidth="1"
            />
          </g>
          <g display={lv.p5} className="sway" style={{ animationDelay: '-1.5s' }}>
            <path
              d="M861 556 C 851 548, 852 534, 861 528 C 870 534, 871 548, 861 556 Z"
              fill="url(#m-catnip)"
              stroke="#1e4a24"
              strokeWidth="1"
            />
          </g>
          <g display={lv.p6} className="sway" style={{ animationDelay: '-2.5s' }}>
            <path
              d="M921 556 C 911 548, 912 534, 921 528 C 930 534, 931 548, 921 556 Z"
              fill="url(#m-catnip)"
              stroke="#1e4a24"
              strokeWidth="1"
            />
          </g>
        </g>
        <g className="rune" fill="#c9a2ff">
          <circle cx="846" cy="546" r="3" />
          <circle cx="906" cy="546" r="3" />
          <circle cx="936" cy="547" r="3" />
          <circle cx="876" cy="547" r="2.5" />
        </g>
        <circle className="rune" cx="895" cy="560" r="60" fill="url(#m-arcane)" opacity="0.35" />
      </g>

      {/* Marché nocturne */}
      <g>
        <circle
          className="flicker"
          cx="834"
          cy="384"
          r="80"
          fill="url(#m-lamp)"
          style={{ opacity: 'var(--art-map-windows)' }}
        />
        <ellipse
          cx="836"
          cy="416"
          rx="76"
          ry="8"
          fill="#000"
          opacity="0.45"
          filter="url(#m-soft)"
        />
        <path
          d="M770 414 L 772 384 L 826 384 L 828 414 Z"
          fill="url(#m-wood)"
          stroke="#1a0e08"
          strokeWidth="2"
        />
        <path
          d="M762 386 C 768 372, 772 360, 776 352 L 822 352 C 826 360, 830 372, 836 386 C 828 392, 822 386, 816 392 C 808 386, 802 392, 794 386 C 786 392, 780 386, 772 392 C 768 388, 764 390, 762 386 Z"
          fill="#a8243a"
          stroke="#3a0812"
          strokeWidth="2"
        />
        <path
          d="M788 352 L 784 390 M808 352 L 810 390"
          stroke="#f0e2c4"
          strokeWidth="6"
          opacity="0.9"
        />
        <path
          d="M840 418 L 842 388 L 896 388 L 898 418 Z"
          fill="url(#m-wood)"
          stroke="#1a0e08"
          strokeWidth="2"
        />
        <path
          d="M832 390 C 838 376, 842 364, 846 356 L 892 356 C 896 364, 900 376, 906 390 C 898 396, 892 390, 886 396 C 878 390, 872 396, 864 390 C 856 396, 850 390, 842 396 C 838 392, 834 394, 832 390 Z"
          fill="#4a2a7a"
          stroke="#1a0a30"
          strokeWidth="2"
        />
        <path
          d="M858 356 L 854 394 M878 356 L 880 394"
          stroke="#d4a64a"
          strokeWidth="6"
          opacity="0.9"
        />
        <g fill="#c98a4f" stroke="#5a3418" strokeWidth="1">
          <ellipse cx="788" cy="380" rx="8" ry="4" />
          <ellipse cx="806" cy="381" rx="8" ry="4" />
        </g>
        <g fill="#f4f1ea" stroke="#5a5a66" strokeWidth="1">
          <rect x="856" y="374" width="7" height="12" rx="2" />
          <rect x="868" y="374" width="7" height="12" rx="2" />
          <rect x="880" y="374" width="7" height="12" rx="2" />
        </g>
        <path d="M760 420 L 760 346 M760 346 L 772 346" stroke="#2a1a12" strokeWidth="3" />
        <circle className="flicker" cx="772" cy="352" r="5" fill="#ffcf7a" />
      </g>

      {/* Taverne à colombages */}
      <g>
        <circle
          className="flicker"
          cx="474"
          cy="590"
          r="100"
          fill="url(#m-lamp)"
          style={{ opacity: 'var(--art-map-windows)' }}
        />
        <ellipse
          cx="474"
          cy="644"
          rx="86"
          ry="10"
          fill="#000"
          opacity="0.5"
          filter="url(#m-soft)"
        />
        <path
          d="M420 642 L 420 592 L 528 592 L 528 642 Z"
          fill="url(#m-plaster)"
          stroke="#2a1a10"
          strokeWidth="2.5"
        />
        <path
          d="M412 594 L 412 548 L 536 548 L 536 594 Z"
          fill="url(#m-plaster)"
          stroke="#2a1a10"
          strokeWidth="2.5"
        />
        <g stroke="#3b2316" strokeWidth="5" strokeLinecap="square">
          <path d="M412 548 V 594 M450 548 V 594 M498 548 V 594 M536 548 V 594 M412 571 L 450 548 M498 548 L 536 571" />
          <path d="M420 592 V 642 M462 592 V 642 M528 592 V 642 M406 594 H 542" />
        </g>
        <path
          d="M400 552 C 420 524, 444 504, 474 490 C 504 504, 528 524, 548 552 Z"
          fill="#4a2a1c"
          stroke="#1a0c06"
          strokeWidth="2.5"
        />
        <path
          d="M400 552 C 420 524, 444 504, 474 490 C 504 504, 528 524, 548 552 Z"
          fill="url(#m-tiles)"
        />
        <path
          d="M506 516 L 506 486 L 522 486 L 522 528 Z"
          fill="url(#m-stoneSide)"
          stroke="#1a1420"
          strokeWidth="2"
        />
        <g className="smokewind" fill="#8a8494" opacity="0.5">
          <circle cx="514" cy="474" r="7" />
          <circle cx="520" cy="460" r="9" style={{ animationDelay: '0.8s' }} />
          <circle cx="510" cy="446" r="11" style={{ animationDelay: '1.6s' }} />
        </g>
        <path
          d="M466 642 L 466 612 C 466 600, 486 600, 486 612 L 486 642 Z"
          fill="#2a1408"
          stroke="#1a0a04"
          strokeWidth="2"
        />
        <g className="flicker" style={{ fill: 'var(--art-map-window)' }}>
          <rect x="426" y="604" width="22" height="18" rx="2" />
          <rect x="500" y="604" width="20" height="18" rx="2" />
          <rect x="462" y="558" width="26" height="22" rx="2" />
          <rect x="420" y="558" width="20" height="20" rx="2" />
          <rect x="508" y="558" width="20" height="20" rx="2" />
        </g>
        <path d="M542 580 L 562 580" stroke="#2a1a12" strokeWidth="3" />
        <g className="sway">
          <path d="M548 580 L 548 588 M560 580 L 560 588" stroke="#2a1a12" strokeWidth="1.5" />
          <rect
            x="544"
            y="588"
            width="22"
            height="18"
            rx="2"
            fill="#6b4a2f"
            stroke="#2a1a12"
            strokeWidth="1.5"
          />
          <path
            d="M550 592 l 0 10 l 8 0 l 0 -10 z M558 594 q 4 0 4 3 q 0 3 -4 3"
            fill="#e9dcc3"
            stroke="#2a1a12"
            strokeWidth="1"
          />
        </g>
        <g fill="url(#m-wood)" stroke="#2a1408" strokeWidth="1.5">
          <ellipse cx="400" cy="632" rx="10" ry="12" />
          <ellipse cx="386" cy="638" rx="9" ry="10" />
        </g>
      </g>

      {/* Bateau de pêche */}
      <g className={popClass.sawmill}>
        <g className="bob">
          <path
            d="M150 622 C 168 650, 260 656, 292 622 Z"
            fill="url(#m-wood)"
            stroke="#1a0e08"
            strokeWidth="2.5"
          />
          <path
            d="M160 632 C 190 644, 250 646, 284 630 M168 640 C 196 650, 244 652, 276 638"
            fill="none"
            stroke="#2a1408"
            strokeWidth="1.5"
            opacity="0.7"
          />
          <path d="M150 622 L 292 622" stroke="#6b4a2f" strokeWidth="4" />
          <path d="M222 622 L 222 508" stroke="#3b2316" strokeWidth="5" strokeLinecap="round" />
          <path
            d="M226 516 C 262 540, 270 580, 262 612 L 226 612 Z"
            fill="url(#m-sail)"
            stroke="#5a4a32"
            strokeWidth="1.8"
          />
          <path
            d="M226 540 C 248 552, 254 572, 250 600"
            fill="none"
            stroke="#000"
            strokeOpacity="0.18"
            strokeWidth="3"
          />
          <g display={lv.sail2}>
            <path
              d="M218 528 C 192 548, 184 582, 190 612 L 218 612 Z"
              fill="#a8243a"
              stroke="#3a0812"
              strokeWidth="1.8"
            />
          </g>
          <g display={lv.sail3}>
            <path
              className="sway"
              d="M222 508 L 252 498 L 222 516 Z"
              fill="#d4a64a"
              stroke="#5a3a12"
              strokeWidth="1.5"
            />
          </g>
          <path d="M286 624 Q 330 584 352 640" fill="none" stroke="#b9a988" strokeWidth="1.6" />
          <path
            d="M150 624 C 168 652, 260 658, 292 624"
            fill="none"
            strokeWidth="1.5"
            opacity="0.6"
            transform="translate(0 30) scale(1 0.4) translate(0 900)"
            style={{ stroke: 'var(--art-map-waterHi)' }}
          />
        </g>
      </g>

      {/* Vent, feuilles et vols */}
      <g
        className="gust"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ stroke: 'var(--art-map-gust)' }}
      >
        <path d="M80 240 C 240 220, 380 250, 520 230 C 600 220, 640 196, 610 186 C 590 180, 576 200, 600 206" />
        <path d="M300 470 C 460 450, 600 480, 760 456" style={{ animationDelay: '2.4s' }} />
        <path
          d="M600 330 C 760 310, 900 340, 1040 316 C 1100 306, 1120 284, 1094 278 C 1076 276, 1068 294, 1090 298"
          style={{ animationDelay: '4.6s' }}
        />
        <path d="M40 560 C 200 540, 300 566, 420 548" style={{ animationDelay: '1.2s' }} />
      </g>
      <g>
        <path className="leaf" d="M-20 420 c 4 -6 12 -6 14 0 c -4 6 -10 6 -14 0 z" fill="#c8a040" />
        <path
          className="leaf"
          d="M-20 300 c 4 -6 12 -6 14 0 c -4 6 -10 6 -14 0 z"
          fill="#a85a2a"
          style={{ animationDelay: '3s', animationDuration: '11s' }}
        />
        <path
          className="leaf"
          d="M-20 520 c 4 -6 12 -6 14 0 c -4 6 -10 6 -14 0 z"
          fill="#6a9a3a"
          style={{ animationDelay: '6s' }}
        />
        <path
          className="leaf"
          d="M-20 360 c 3 -5 9 -5 11 0 c -3 5 -8 5 -11 0 z"
          fill="#d07a3a"
          style={{ animationDelay: '1.5s', animationDuration: '13s' }}
        />
      </g>
      <g className="flock">
        <g transform="translate(0 180)">
          <path
            className="wing"
            d="M0 0 q 7 -7 14 0 q 7 -7 14 0"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ stroke: 'var(--art-map-bird)' }}
          />
        </g>
        <g transform="translate(30 168) scale(0.8)">
          <path
            className="wing"
            d="M0 0 q 7 -7 14 0 q 7 -7 14 0"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animationDelay: '-0.2s', stroke: 'var(--art-map-bird)' }}
          />
        </g>
        <g transform="translate(-26 194) scale(0.85)">
          <path
            className="wing"
            d="M0 0 q 7 -7 14 0 q 7 -7 14 0"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animationDelay: '-0.35s', stroke: 'var(--art-map-bird)' }}
          />
        </g>
        <g transform="translate(56 190) scale(0.7)">
          <path
            className="wing"
            d="M0 0 q 7 -7 14 0 q 7 -7 14 0"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animationDelay: '-0.1s', stroke: 'var(--art-map-bird)' }}
          />
        </g>
      </g>

      {/* Brume, braises, lucioles, grain et vignette */}
      <g
        className="fog"
        fill="#c9bfe0"
        filter="url(#m-soft)"
        style={{ opacity: 'var(--art-map-fog)' }}
      >
        <ellipse cx="300" cy="320" rx="280" ry="22" />
        <ellipse cx="900" cy="330" rx="320" ry="20" />
        <ellipse cx="640" cy="490" rx="360" ry="18" />
      </g>
      <g fill="#ff9a4d">
        <circle className="ember" cx="560" cy="700" r="2.5" />
        <circle className="ember" cx="620" cy="710" r="2" style={{ animationDelay: '1.2s' }} />
        <circle className="ember" cx="480" cy="700" r="2" style={{ animationDelay: '2.4s' }} />
        <circle className="ember" cx="700" cy="705" r="2.5" style={{ animationDelay: '3.1s' }} />
        <circle className="ember" cx="900" cy="710" r="2" style={{ animationDelay: '0.6s' }} />
        <circle className="ember" cx="300" cy="705" r="2" style={{ animationDelay: '4s' }} />
        <circle className="ember" cx="1040" cy="700" r="2.5" style={{ animationDelay: '2s' }} />
      </g>
      <g fill="#e8ff8a" style={{ opacity: 'var(--art-map-stars)' }}>
        <circle className="firefly" cx="760" cy="520" r="2.2" />
        <circle className="firefly" cx="880" cy="500" r="2" style={{ animationDelay: '1.4s' }} />
        <circle className="firefly" cx="420" cy="470" r="2" style={{ animationDelay: '0.7s' }} />
        <circle className="firefly" cx="1000" cy="560" r="2.2" style={{ animationDelay: '2.1s' }} />
      </g>
      <rect width="1640" height="720" filter="url(#m-grain)" opacity="0.18" />
      <rect width="1640" height="720" fill="url(#m-vignette)" />
    </svg>
  )
}
