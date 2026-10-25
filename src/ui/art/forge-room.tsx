/*
 * Décor dessiné en SVG (thème « royaume des chats ») : l'atelier de la forge. Formes et
 * dégradés seulement, aucune logique. Les animations sont des classes CSS (app/art.css),
 * rangées sous .art-forge et coupées par prefers-reduced-motion.
 */

/** Atelier de la forge : four, hotte, soufflet, enclume, râtelier d'armes et tonneau d'eau. */
export function ForgeBackdrop({ heat = 0 }: { heat?: number }) {
  // Plus la forge est haute, plus le feu est vif : de 0 (niveau 1) à 1 (niveau maximal).
  const glow = 0.45 + 0.4 * heat
  return (
    <svg
      viewBox="0 0 1640 720"
      width="100%"
      className="art-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="f-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-dun-wall1)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-dun-wall2)' }} />
        </linearGradient>
        <linearGradient id="f-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1210" />
          <stop offset="100%" stopColor="#0c0806" />
        </linearGradient>
        <linearGradient id="f-stone" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#6e6476" />
          <stop offset="100%" stopColor="#2e2836" />
        </linearGradient>
        <linearGradient id="f-iron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a8696" />
          <stop offset="45%" stopColor="#3a3644" />
          <stop offset="100%" stopColor="#14121a" />
        </linearGradient>
        <linearGradient id="f-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a2212" />
          <stop offset="45%" stopColor="#8a5a32" />
          <stop offset="100%" stopColor="#24140a" />
        </linearGradient>
        <linearGradient id="f-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f4f2fa" />
          <stop offset="100%" stopColor="#7a7690" />
        </linearGradient>
        <radialGradient id="f-fire" cx="50%" cy="75%" r="70%">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="30%" stopColor="#ffd06a" />
          <stop offset="70%" stopColor="#ff6a1a" />
          <stop offset="100%" stopColor="#8a1a08" />
        </radialGradient>
        <radialGradient id="f-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8a2a" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#ff6a1a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="f-hot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="50%" stopColor="#ff9a3d" />
          <stop offset="100%" stopColor="#c8300a" />
        </radialGradient>
        <radialGradient id="f-vignette" cx="40%" cy="55%" r="75%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <pattern id="f-bricks" width="80" height="44" patternUnits="userSpaceOnUse">
          <path
            d="M0 1 H80 M0 23 H80 M20 1 V23 M60 23 V44"
            fill="none"
            stroke="#000"
            strokeOpacity="0.45"
            strokeWidth="3"
          />
        </pattern>
        <filter id="f-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Murs de briques et poutres */}
      <rect width="1640" height="480" fill="url(#f-wall)" />
      <rect width="1640" height="480" fill="url(#f-bricks)" />
      <rect y="30" width="1640" height="34" fill="url(#f-wood)" />
      <path d="M0 64 H1640" stroke="#0c0806" strokeWidth="4" />
      <rect x="260" y="0" width="34" height="480" fill="url(#f-wood)" />
      <rect x="1120" y="0" width="34" height="480" fill="url(#f-wood)" />

      {/* Lueur du four sur le mur */}
      <circle className="flicker" cx="560" cy="330" r="360" fill="url(#f-glow)" opacity={glow} />

      {/* Four en pierre, sa hotte et son conduit */}
      <path d="M470 0 H 650 V 140 L 700 210 H 420 L 470 140 Z" fill="url(#f-stone)" />
      <path
        d="M470 0 H 650 V 140 L 700 210 H 420 L 470 140 Z"
        fill="url(#f-bricks)"
        stroke="#14101a"
        strokeWidth="3"
      />
      <path d="M410 210 H 710 V 228 H 410 Z" fill="url(#f-iron)" stroke="#0c0a10" strokeWidth="2" />
      <path
        d="M420 480 V 250 C 420 236, 700 236, 700 250 V 480 Z"
        fill="url(#f-stone)"
        stroke="#14101a"
        strokeWidth="4"
      />
      <path d="M420 480 V 250 C 420 236, 700 236, 700 250 V 480 Z" fill="url(#f-bricks)" />
      <path
        d="M470 470 V 330 C 470 290, 650 290, 650 330 V 470 Z"
        fill="#0a0604"
        stroke="#2a1a10"
        strokeWidth="6"
      />
      <g className="fire">
        <path
          d="M490 470 C 480 420, 520 400, 512 350 C 540 380, 566 400, 560 436 C 570 414, 586 404, 586 380 C 612 414, 630 446, 630 470 Z"
          fill="url(#f-fire)"
        />
        <path
          d="M520 470 C 514 440, 536 424, 534 394 C 556 418, 572 440, 566 470 Z"
          fill="#fff0b0"
          opacity="0.8"
        />
      </g>
      <ellipse
        cx="560"
        cy="470"
        rx="90"
        ry="10"
        fill="#ffb84d"
        opacity="0.5"
        filter="url(#f-blur)"
      />
      <g fill="#2a1a10">
        <ellipse cx="520" cy="472" rx="22" ry="7" />
        <ellipse cx="580" cy="474" rx="26" ry="8" />
      </g>

      {/* Soufflet de cuir */}
      <g transform="translate(712 412)">
        <path
          d="M0 40 L 90 10 L 100 30 L 90 70 Z"
          fill="#6a3a1e"
          stroke="#1a0c06"
          strokeWidth="3"
        />
        <path d="M14 36 L 86 18 M14 46 L 92 42 M14 56 L 88 64" stroke="#3a1e0e" strokeWidth="2" />
        <path d="M-40 40 H 4" stroke="url(#f-iron)" strokeWidth="8" strokeLinecap="round" />
        <path d="M100 30 L 140 10" stroke="url(#f-wood)" strokeWidth="10" strokeLinecap="round" />
      </g>

      {/* Râtelier d'armes */}
      <g transform="translate(860 120)">
        <rect
          x="0"
          y="0"
          width="200"
          height="16"
          fill="url(#f-wood)"
          stroke="#1a0c06"
          strokeWidth="2"
        />
        <rect
          x="0"
          y="180"
          width="200"
          height="16"
          fill="url(#f-wood)"
          stroke="#1a0c06"
          strokeWidth="2"
        />
        <g stroke="#14121a" strokeWidth="2">
          <path d="M30 -10 L 38 -30 L 46 -10 L 44 190 L 32 190 Z" fill="url(#f-blade)" />
          <path d="M80 -6 L 92 -24 L 104 -6 L 100 190 L 84 190 Z" fill="url(#f-blade)" />
          <path d="M140 0 C 170 10, 180 50, 156 80 L 150 190 L 140 190 Z" fill="url(#f-blade)" />
        </g>
        <g fill="#d4a64a">
          <rect x="26" y="150" width="24" height="6" rx="2" />
          <rect x="78" y="150" width="28" height="6" rx="2" />
        </g>
      </g>

      {/* Bouclier au mur */}
      <g transform="translate(160 150)">
        <path
          d="M0 0 H 70 V 40 C 70 80, 35 100, 35 100 C 35 100, 0 80, 0 40 Z"
          fill="#6a1a2a"
          stroke="url(#f-iron)"
          strokeWidth="6"
        />
        <path
          d="M35 22 c -12 0 -16 -12 -9 -18 c 4 -3 9 -1 9 3 c 0 -4 5 -6 9 -3 c 7 6 3 18 -9 18 z"
          fill="#d4a64a"
          transform="translate(0 30)"
        />
      </g>

      {/* Sol de dalles et lueur au sol */}
      <path d="M0 480 H 1640 V 720 H 0 Z" fill="url(#f-floor)" />
      <path
        d="M0 540 H1640 M0 620 H1640 M200 480 L 120 720 M520 480 L 480 720 M840 480 L 840 720 M1160 480 L 1200 720"
        stroke="#000"
        strokeOpacity="0.5"
        strokeWidth="3"
      />
      <ellipse cx="560" cy="530" rx="420" ry="80" fill="url(#f-glow)" opacity={glow * 0.6} />

      {/* Enclume sur sa souche */}
      <g transform="translate(700 470)">
        <ellipse
          cx="80"
          cy="150"
          rx="110"
          ry="16"
          fill="#000"
          opacity="0.6"
          filter="url(#f-blur)"
        />
        <path
          d="M40 150 L 46 70 H 114 L 120 150 Z"
          fill="url(#f-wood)"
          stroke="#1a0c06"
          strokeWidth="3"
        />
        <ellipse cx="80" cy="70" rx="34" ry="8" fill="#a87444" stroke="#1a0c06" strokeWidth="2" />
        <path
          d="M10 20 H 150 C 160 20, 170 26, 180 34 C 168 36, 156 36, 150 40 L 128 44 L 120 70 H 40 L 32 44 L 6 40 C 0 34, 2 22, 10 20 Z"
          fill="url(#f-iron)"
          stroke="#0c0a10"
          strokeWidth="3"
        />
        <path d="M14 22 H 148" stroke="#c9c4d6" strokeWidth="2" opacity="0.6" />
      </g>

      {/* Tonneau d'eau de trempe */}
      <g transform="translate(1000 520)">
        <path
          d="M0 90 C -8 60, -8 20, 0 0 H 90 C 98 20, 98 60, 90 90 Z"
          fill="url(#f-wood)"
          stroke="#1a0c06"
          strokeWidth="3"
        />
        <path d="M-4 18 H 94 M-6 70 H 96" stroke="url(#f-iron)" strokeWidth="6" />
        <ellipse cx="45" cy="0" rx="45" ry="9" fill="#2a4a6a" stroke="#1a0c06" strokeWidth="3" />
        <g fill="#c9d8e8" opacity="0.6">
          <circle className="steam" cx="40" cy="-6" r="6" />
          <circle className="steam" cx="54" cy="-8" r="5" style={{ animationDelay: '1.2s' }} />
        </g>
      </g>

      {/* Tas de charbon et outils */}
      <g fill="#14100e" stroke="#000" strokeWidth="1.5">
        <ellipse cx="300" cy="640" rx="80" ry="22" />
        <circle cx="270" cy="626" r="12" />
        <circle cx="300" cy="620" r="14" />
        <circle cx="330" cy="628" r="11" />
      </g>
      <path d="M380 560 L 440 700" stroke="url(#f-wood)" strokeWidth="10" strokeLinecap="round" />
      <path d="M368 552 L 396 552 L 394 576 L 370 576 Z" fill="url(#f-iron)" />

      {/* Étincelles et braises */}
      <g fill="#ffcf7a">
        <circle className="ember" cx="540" cy="440" r="2.5" />
        <circle className="ember" cx="580" cy="430" r="2" style={{ animationDelay: '1.3s' }} />
        <circle className="ember" cx="560" cy="450" r="2" style={{ animationDelay: '2.4s' }} />
        <circle className="ember" cx="600" cy="446" r="1.8" style={{ animationDelay: '3.1s' }} />
      </g>

      <rect width="1640" height="720" fill="url(#f-vignette)" />
    </svg>
  )
}

/** Pièce chauffée à blanc sur l'enclume, avec des étincelles : un objet en fabrication. */
export function HotMetal() {
  return (
    <svg viewBox="0 0 200 120" width="100%" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="80" rx="80" ry="22" fill="#ff8a2a" opacity="0.35" />
      <path
        d="M40 78 C 60 60, 140 60, 160 78 C 140 90, 60 90, 40 78 Z"
        fill="url(#f-hot)"
        className="flicker"
      />
      <g fill="#ffe08a">
        <circle className="spark" cx="100" cy="66" r="3" />
        <circle className="spark" cx="110" cy="66" r="2.5" style={{ animationDelay: '0.3s' }} />
        <circle className="spark" cx="90" cy="66" r="2" style={{ animationDelay: '0.6s' }} />
      </g>
    </svg>
  )
}
