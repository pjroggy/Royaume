/*
 * Décor dessiné en SVG (thème « royaume des chats »). Fichier produit à partir de l'aperçu
 * validé : formes et dégradés seulement, aucune logique. Les couleurs qui changent entre le
 * jour et la nuit sont des variables CSS (--art-…), définies dans app/art.css : le décor suit
 * le thème sans être rendu de nouveau. Les animations sont des classes CSS, coupées par
 * prefers-reduced-motion.
 */

/** Salle des héros : vitraux, bannières et podium sculpté des trois premiers. */
export function HallBackdrop() {
  return (
    <svg
      viewBox="0 0 1640 480"
      width="100%"
      className="art-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="c-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-hall-wall1)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-hall-wall2)' }} />
        </linearGradient>
        <linearGradient id="c-block" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="c-pillar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a4e6a" />
          <stop offset="45%" stopColor="#2e2640" />
          <stop offset="100%" stopColor="#0e0a14" />
        </linearGradient>
        <linearGradient id="c-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-hall-glass1)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-hall-glass2)' }} />
        </linearGradient>
        <radialGradient id="c-beam" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopOpacity="0.45" style={{ stopColor: 'var(--art-hall-beam)' }} />
          <stop offset="100%" stopOpacity="0" style={{ stopColor: 'var(--art-hall-beam)' }} />
        </radialGradient>
        <linearGradient id="c-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a6420" />
          <stop offset="35%" stopColor="#ffe08a" />
          <stop offset="60%" stopColor="#d4a64a" />
          <stop offset="100%" stopColor="#5a3c10" />
        </linearGradient>
        <linearGradient id="c-silver" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a5a68" />
          <stop offset="35%" stopColor="#f0f0f8" />
          <stop offset="60%" stopColor="#a8a8b8" />
          <stop offset="100%" stopColor="#3a3a46" />
        </linearGradient>
        <linearGradient id="c-bronze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a2e14" />
          <stop offset="35%" stopColor="#f0a86a" />
          <stop offset="60%" stopColor="#b8703a" />
          <stop offset="100%" stopColor="#3a1a08" />
        </linearGradient>
        <linearGradient id="c-plinth" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a4258" />
          <stop offset="40%" stopColor="#7a7088" />
          <stop offset="100%" stopColor="#1e1a26" />
        </linearGradient>
        <linearGradient id="c-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#120e18" />
          <stop offset="100%" style={{ stopColor: 'var(--art-hall-floor)' }} />
        </linearGradient>
        <linearGradient id="c-carpet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a0a16" />
          <stop offset="50%" stopColor="#8a1a2e" />
          <stop offset="100%" stopColor="#3a0a16" />
        </linearGradient>
        <linearGradient id="c-banner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1440" />
          <stop offset="30%" stopColor="#3a2a8a" />
          <stop offset="55%" stopColor="#221a5a" />
          <stop offset="80%" stopColor="#3a2a8a" />
          <stop offset="100%" stopColor="#120e30" />
        </linearGradient>
        <radialGradient id="c-candle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb84d" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="c-vignette" cx="35%" cy="55%" r="75%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <filter id="c-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="5"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
          />
        </filter>
        <pattern id="c-stones" width="150" height="64" patternUnits="userSpaceOnUse">
          <path
            d="M3 3 Q 70 0 147 4 L 147 29 Q 70 32 3 29 Z M-72 35 Q 0 32 72 36 L 72 61 Q 0 64 -72 61 Z M78 35 Q 150 32 222 36 L 222 61 Q 150 64 78 61 Z"
            fill="url(#c-block)"
            stroke="#07050a"
            strokeWidth="2.5"
          />
        </pattern>
      </defs>

      <rect width="1640" height="480" fill="url(#c-wall)" />
      <rect width="1640" height="360" fill="url(#c-stones)" />

      {/* Vitraux et rayons de lumière */}
      <g>
        <path
          d="M180 300 L 180 120 C 180 60, 300 60, 300 120 L 300 300 Z"
          fill="url(#c-glass)"
          stroke="#0e0a14"
          strokeWidth="10"
        />
        <path
          d="M240 64 V 300 M180 180 H 300 M180 240 H 300 M200 92 L 240 140 L 280 92"
          stroke="#0e0a14"
          strokeWidth="5"
          fill="none"
        />
        <g opacity="0.85">
          <path d="M186 186 h 50 v 50 h -50 z" fill="#c2263b" />
          <path d="M244 186 h 50 v 50 h -50 z" fill="#d4a64a" />
          <path d="M186 246 h 50 v 50 h -50 z" fill="#3a6ad0" />
          <path d="M244 246 h 50 v 50 h -50 z" fill="#58c26a" />
          <circle cx="240" cy="130" r="22" fill="#9b6bff" />
        </g>
        <path
          d="M760 300 L 760 120 C 760 60, 880 60, 880 120 L 880 300 Z"
          fill="url(#c-glass)"
          stroke="#0e0a14"
          strokeWidth="10"
        />
        <path
          d="M820 64 V 300 M760 180 H 880 M760 240 H 880 M780 92 L 820 140 L 860 92"
          stroke="#0e0a14"
          strokeWidth="5"
          fill="none"
        />
        <g opacity="0.85">
          <path d="M766 186 h 50 v 50 h -50 z" fill="#d4a64a" />
          <path d="M824 186 h 50 v 50 h -50 z" fill="#c2263b" />
          <path d="M766 246 h 50 v 50 h -50 z" fill="#58c26a" />
          <path d="M824 246 h 50 v 50 h -50 z" fill="#3a6ad0" />
          <circle cx="820" cy="130" r="22" fill="#ffb84d" />
        </g>
        <path
          d="M180 300 L 300 300 L 460 480 L 60 480 Z"
          fill="url(#c-beam)"
          style={{ opacity: 'var(--art-hall-beams)' }}
        />
        <path
          d="M760 300 L 880 300 L 1040 480 L 640 480 Z"
          fill="url(#c-beam)"
          style={{ opacity: 'var(--art-hall-beams)' }}
        />
        <g fill="#ffe8b0" style={{ opacity: 'var(--art-hall-beams)' }}>
          <circle className="dust" cx="220" cy="320" r="1.6" />
          <circle className="dust" cx="260" cy="300" r="1.2" style={{ animationDelay: '2s' }} />
          <circle className="dust" cx="800" cy="320" r="1.6" style={{ animationDelay: '1s' }} />
          <circle className="dust" cx="840" cy="300" r="1.2" style={{ animationDelay: '3.5s' }} />
        </g>
      </g>

      {/* Bannières du royaume */}
      <g className="banner" stroke="#07050a" strokeWidth="2.5">
        <path d="M430 20 L 500 20 L 502 190 L 466 166 L 428 190 Z" fill="url(#c-banner)" />
      </g>
      <g className="banner" stroke="#07050a" strokeWidth="2.5" style={{ animationDelay: '-2s' }}>
        <path d="M560 20 L 630 20 L 632 190 L 596 166 L 558 190 Z" fill="url(#c-banner)" />
      </g>
      <g fill="url(#c-gold)" stroke="#5a3c10" strokeWidth="1.5">
        <path d="M465 96 l 6 12 l 13 2 l -10 9 l 3 13 l -12 -7 l -12 7 l 3 -13 l -10 -9 l 13 -2 z" />
        <path d="M595 96 l 6 12 l 13 2 l -10 9 l 3 13 l -12 -7 l -12 7 l 3 -13 l -10 -9 l 13 -2 z" />
      </g>
      <path d="M420 18 H 640" stroke="url(#c-gold)" strokeWidth="7" strokeLinecap="round" />

      {/* Piliers */}
      <path d="M0 0 H 70 V 360 H 0 Z M1080 0 H 1150 V 360 H 1080 Z" fill="url(#c-pillar)" />
      <path
        d="M0 30 H 76 M0 340 H 80 M1074 30 H 1156 M1070 340 H 1160"
        stroke="#5a4e6a"
        strokeWidth="10"
      />

      {/* Sol et tapis */}
      <path d="M0 360 H 1640 V 480 H 0 Z" fill="url(#c-floor)" />
      <path d="M0 360 H1640" stroke="#07050a" strokeWidth="6" />
      <path d="M440 360 L 620 360 L 760 480 L 300 480 Z" fill="url(#c-carpet)" />
      <path d="M452 360 L 316 480 M608 360 L 744 480" stroke="url(#c-gold)" strokeWidth="4" />

      {/* Rayons derrière le podium */}
      <g className="rays" fill="#ffd27a" style={{ opacity: 'var(--art-hall-raysOpacity)' }}>
        <path d="M530 280 L 520 60 L 540 60 Z" />
        <path d="M530 280 L 660 100 L 672 112 Z" />
        <path d="M530 280 L 400 100 L 388 112 Z" />
        <path d="M530 280 L 720 220 L 722 236 Z" />
        <path d="M530 280 L 340 220 L 338 236 Z" />
        <path d="M530 280 L 600 70 L 616 76 Z" />
        <path d="M530 280 L 460 70 L 444 76 Z" />
      </g>

      {/* Podium sculpté */}
      <g stroke="#07050a" strokeWidth="3">
        <path d="M360 440 L 360 340 L 480 340 L 480 440 Z" fill="url(#c-plinth)" />
        <path d="M470 440 L 470 296 L 590 296 L 590 440 Z" fill="url(#c-plinth)" />
        <path d="M580 440 L 580 362 L 700 362 L 700 440 Z" fill="url(#c-plinth)" />
        <path d="M352 340 H 488 V 352 H 352 Z" fill="url(#c-silver)" />
        <path d="M462 296 H 598 V 308 H 462 Z" fill="url(#c-gold)" />
        <path d="M572 362 H 708 V 374 H 572 Z" fill="url(#c-bronze)" />
      </g>
      <g fontFamily="Cinzel, Georgia, serif" fontWeight="700" textAnchor="middle">
        <circle cx="420" cy="396" r="22" fill="url(#c-silver)" stroke="#07050a" strokeWidth="2" />
        <text x="420" y="404" fontSize="24" fill="#1a1420">
          2
        </text>
        <circle cx="530" cy="372" r="26" fill="url(#c-gold)" stroke="#07050a" strokeWidth="2" />
        <text x="530" y="382" fontSize="28" fill="#3a2408">
          1
        </text>
        <circle cx="640" cy="404" r="20" fill="url(#c-bronze)" stroke="#07050a" strokeWidth="2" />
        <text x="640" y="411" fontSize="22" fill="#2a1008">
          3
        </text>
      </g>
      <rect
        className="shine"
        x="476"
        y="298"
        width="20"
        height="140"
        fill="#fff"
        opacity="0"
        transform="skewX(-18)"
      />

      {/* Coupe et candélabres */}
      <g transform="translate(760 300)">
        <circle className="flicker" cx="0" cy="-40" r="70" fill="url(#c-candle)" />
        <path
          d="M-10 60 h 20 l -4 -40 h -12 z M-22 64 h 44 v 8 h -44 z"
          fill="url(#c-gold)"
          stroke="#5a3c10"
          strokeWidth="2"
        />
        <path
          d="M-30 20 C -32 -10, 32 -10, 30 20 L 0 20 Z"
          fill="url(#c-gold)"
          stroke="#5a3c10"
          strokeWidth="2"
        />
        <path
          d="M-30 -2 q -14 0 -14 10 q 0 10 14 10 M30 -2 q 14 0 14 10 q 0 10 -14 10"
          fill="none"
          stroke="url(#c-gold)"
          strokeWidth="4"
        />
      </g>
      <g>
        <circle className="flicker" cx="120" cy="300" r="60" fill="url(#c-candle)" />
        <circle
          className="flicker"
          cx="960"
          cy="300"
          r="60"
          fill="url(#c-candle)"
          style={{ animationDelay: '0.6s' }}
        />
        <path
          d="M112 360 V 314 h 16 v 46 z M952 360 V 314 h 16 v 46 z"
          fill="#efe2c4"
          stroke="#3a2a1a"
          strokeWidth="1.5"
        />
        <path
          className="flicker"
          d="M120 314 q -7 -12 0 -22 q 7 10 0 22 z M960 314 q -7 -12 0 -22 q 7 10 0 22 z"
          fill="#ffd27a"
        />
      </g>

      {/* Confettis */}
      <g>
        <rect className="confetti" x="420" y="0" width="6" height="10" fill="#c2263b" />
        <rect
          className="confetti"
          x="470"
          y="0"
          width="6"
          height="10"
          fill="#d4a64a"
          style={{ animationDelay: '0.8s' }}
        />
        <rect
          className="confetti"
          x="520"
          y="0"
          width="5"
          height="9"
          fill="#58c26a"
          style={{ animationDelay: '1.6s' }}
        />
        <rect
          className="confetti"
          x="560"
          y="0"
          width="6"
          height="10"
          fill="#9b6bff"
          style={{ animationDelay: '2.4s' }}
        />
        <rect
          className="confetti"
          x="610"
          y="0"
          width="5"
          height="9"
          fill="#3a8ad0"
          style={{ animationDelay: '3.2s' }}
        />
        <rect
          className="confetti"
          x="650"
          y="0"
          width="6"
          height="10"
          fill="#ffd27a"
          style={{ animationDelay: '4s' }}
        />
        <rect
          className="confetti"
          x="500"
          y="0"
          width="5"
          height="8"
          fill="#ff7a2f"
          style={{ animationDelay: '1.2s' }}
        />
        <rect
          className="confetti"
          x="590"
          y="0"
          width="5"
          height="8"
          fill="#e9dcc3"
          style={{ animationDelay: '2.8s' }}
        />
      </g>

      <rect width="1640" height="480" filter="url(#c-grain)" opacity="0.18" />
      <rect width="1640" height="480" fill="url(#c-vignette)" />
    </svg>
  )
}
