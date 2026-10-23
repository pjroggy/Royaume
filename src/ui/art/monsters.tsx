/*
 * Décor dessiné en SVG (thème « royaume des chats »). Fichier produit à partir de l'aperçu
 * validé : formes et dégradés seulement, aucune logique. Les couleurs qui changent entre le
 * jour et la nuit sont des variables CSS (--art-…), définies dans app/art.css : le décor suit
 * le thème sans être rendu de nouveau. Les animations sont des classes CSS, coupées par
 * prefers-reduced-motion.
 */
import type { CSSProperties } from 'react'
import { useId } from 'react'

/** Identifiant de dégradé sans « : », utilisable dans url(#...). */
const useUid = () => useId().replace(/:/g, '')

/** Rat en armure de cuir, lance au poing (adversaire « goblin » du domaine). */
export function RatSprite() {
  const u = useUid()
  return (
    <svg
      viewBox="0 0 160 170"
      width="100%"
      className="rat"
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`${u}-fur`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#a49aa8" />
          <stop offset="60%" stopColor="#6e6474" />
          <stop offset="100%" stopColor="#2e2834" />
        </radialGradient>
        <radialGradient id={`${u}-ear`} cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#f2a6b4" />
          <stop offset="100%" stopColor="#8a4a58" />
        </radialGradient>
        <linearGradient id={`${u}-tail`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a4a54" />
          <stop offset="100%" stopColor="#e4a2ae" />
        </linearGradient>
        <linearGradient id={`${u}-leather`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4e30" />
          <stop offset="100%" stopColor="#3a2212" />
        </linearGradient>
        <linearGradient id={`${u}-blade`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f2fa" />
          <stop offset="50%" stopColor="#a8a4b8" />
          <stop offset="100%" stopColor="#5a5668" />
        </linearGradient>
        <linearGradient id={`${u}-shaft`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a5a36" />
          <stop offset="100%" stopColor="#3a2212" />
        </linearGradient>
        <radialGradient id={`${u}-eye`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff0a0" />
          <stop offset="40%" stopColor="#ff3b2b" />
          <stop offset="100%" stopColor="#ff3b2b" stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}-sh`} x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <ellipse
        cx="82"
        cy="160"
        rx="50"
        ry="7"
        fill="#000"
        opacity="0.55"
        filter={`url(#${u}-sh)`}
      />
      <path
        className="rtail"
        d="M54 146 C 26 156, 4 150, 6 130 C 8 116, 20 108, 30 112"
        fill="none"
        stroke={`url(#${u}-tail)`}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M54 146 C 26 156, 4 150, 6 130 C 8 116, 20 108, 30 112"
        fill="none"
        stroke="#3a1a22"
        strokeWidth="6"
        strokeDasharray="1 5"
        opacity="0.4"
      />
      <path
        d="M48 156 C 38 128, 44 98, 62 86 L 58 80 L 66 82 L 64 74 L 72 80 L 82 74 L 92 80 L 100 74 L 100 82 L 108 80 L 104 88 C 122 100, 126 130, 116 156 Z"
        fill={`url(#${u}-fur)`}
        stroke="#0b0810"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M64 140 C 70 112, 94 112, 100 140 C 94 150, 70 150, 64 140 Z"
        fill="#a49aa8"
        opacity="0.35"
      />
      <path
        d="M56 118 C 66 106, 98 106, 110 118 L 112 146 C 98 156, 68 156, 54 146 Z"
        fill={`url(#${u}-leather)`}
        stroke="#120a06"
        strokeWidth="2.5"
      />
      <path
        d="M58 128 C 72 122, 96 122, 110 128 M58 138 C 72 132, 96 132, 110 138"
        fill="none"
        stroke="#1a0e08"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <circle cx="62" cy="122" r="2.5" fill="#c9a24a" />
      <circle cx="106" cy="122" r="2.5" fill="#c9a24a" />
      <path
        d="M58 156 C 56 148, 66 146, 70 154 Z M96 154 C 100 146, 110 148, 108 156 Z"
        fill={`url(#${u}-fur)`}
        stroke="#0b0810"
        strokeWidth="2"
      />
      <path
        d="M58 156 l -3 4 M62 157 l 0 4 M66 156 l 3 4 M100 156 l -3 4 M104 157 l 0 4 M108 156 l 3 4"
        stroke="#e6d6c0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M48 46 C 36 34, 40 14, 58 18 C 70 22, 72 40, 64 52 Z"
        fill={`url(#${u}-fur)`}
        stroke="#0b0810"
        strokeWidth="2.5"
      />
      <path d="M52 42 C 46 34, 48 24, 58 25 C 66 28, 66 38, 62 46 Z" fill={`url(#${u}-ear)`} />
      <path
        d="M116 46 C 128 34, 124 14, 106 18 C 94 22, 92 40, 100 52 Z"
        fill={`url(#${u}-fur)`}
        stroke="#0b0810"
        strokeWidth="2.5"
      />
      <path d="M112 42 C 118 34, 116 24, 106 25 C 98 28, 98 38, 102 46 Z" fill={`url(#${u}-ear)`} />
      <path
        d="M54 66 C 50 48, 66 40, 82 40 C 98 40, 114 48, 110 66 C 108 78, 96 88, 90 98 C 86 104, 78 104, 74 98 C 68 88, 56 78, 54 66 Z"
        fill={`url(#${u}-fur)`}
        stroke="#0b0810"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M70 84 C 74 96, 90 96, 94 84 C 90 92, 74 92, 70 84 Z" fill="#2e2834" opacity="0.6" />
      <path
        d="M60 62 l -6 -6 M104 62 l 6 -6 M64 56 l -4 -8 M100 56 l 4 -8"
        stroke="#2e2834"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle cx="70" cy="70" r="9" fill={`url(#${u}-eye)`} className="flicker" />
      <circle cx="94" cy="70" r="9" fill={`url(#${u}-eye)`} className="flicker" />
      <ellipse cx="70" cy="70" rx="4" ry="3.4" fill="#2a0404" />
      <ellipse cx="94" cy="70" rx="4" ry="3.4" fill="#2a0404" />
      <circle cx="71.5" cy="68.5" r="1.4" fill="#ffd0c0" />
      <circle cx="95.5" cy="68.5" r="1.4" fill="#ffd0c0" />
      <path
        d="M65 64 L 76 67 M99 64 L 88 67"
        stroke="#0b0810"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M76 100 C 78 96, 86 96, 88 100 C 86 104, 78 104, 76 100 Z"
        fill="#e48a9a"
        stroke="#3a1420"
        strokeWidth="1.5"
      />
      <path
        d="M79 104 l 1 5 l 2 -4 l 2 4 l 1 -5"
        fill="#f4eee0"
        stroke="#3a3020"
        strokeWidth="0.8"
      />
      <g stroke="#e6dccb" strokeWidth="1" opacity="0.8" fill="none">
        <path d="M74 98 Q 56 94 40 96 M74 100 Q 58 102 44 108 M90 98 Q 108 94 124 96 M90 100 Q 106 102 120 108" />
      </g>
      <path
        d="M52 62 C 52 32, 112 32, 114 62 C 104 56, 62 56, 52 62 Z"
        fill={`url(#${u}-leather)`}
        stroke="#120a06"
        strokeWidth="2.5"
      />
      <path d="M82 36 V 58" stroke="#1a0e08" strokeWidth="2" />
      <circle cx="82" cy="38" r="3" fill="#c9a24a" />
      <path
        d="M130 160 L 134 26"
        stroke={`url(#${u}-shaft)`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M134 4 C 142 16, 142 28, 135 34 L 131 34 C 126 28, 126 16, 134 4 Z"
        fill={`url(#${u}-blade)`}
        stroke="#1a1620"
        strokeWidth="1.5"
      />
      <path
        d="M124 104 C 120 96, 136 92, 138 102 C 140 110, 128 112, 124 104 Z"
        fill={`url(#${u}-fur)`}
        stroke="#0b0810"
        strokeWidth="2"
      />
    </svg>
  )
}

/** Chien squelette (adversaire « skeleton ») : le rat pillard, en os blanchis. */
export function SkeletonSprite() {
  const u = useUid()
  return (
    <span className="art-bones">
      <svg
        viewBox="0 0 160 170"
        width="100%"
        className="rat"
        aria-hidden="true"
        focusable="false"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={`${u}-fur`} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#857c8c" />
            <stop offset="60%" stopColor="#4e4856" />
            <stop offset="100%" stopColor="#1e1a24" />
          </radialGradient>
          <radialGradient id={`${u}-ear`} cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#f2a6b4" />
            <stop offset="100%" stopColor="#8a4a58" />
          </radialGradient>
          <linearGradient id={`${u}-tail`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a4a54" />
            <stop offset="100%" stopColor="#e4a2ae" />
          </linearGradient>
          <linearGradient id={`${u}-leather`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4e30" />
            <stop offset="100%" stopColor="#3a2212" />
          </linearGradient>
          <linearGradient id={`${u}-blade`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4f2fa" />
            <stop offset="50%" stopColor="#a8a4b8" />
            <stop offset="100%" stopColor="#5a5668" />
          </linearGradient>
          <linearGradient id={`${u}-shaft`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a5a36" />
            <stop offset="100%" stopColor="#3a2212" />
          </linearGradient>
          <radialGradient id={`${u}-eye`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff0a0" />
            <stop offset="40%" stopColor="#ff3b2b" />
            <stop offset="100%" stopColor="#ff3b2b" stopOpacity="0" />
          </radialGradient>
          <filter id={`${u}-sh`} x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <ellipse
          cx="82"
          cy="160"
          rx="50"
          ry="7"
          fill="#000"
          opacity="0.55"
          filter={`url(#${u}-sh)`}
        />
        <path
          className="rtail"
          d="M54 146 C 26 156, 4 150, 6 130 C 8 116, 20 108, 30 112"
          fill="none"
          stroke={`url(#${u}-tail)`}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ animationDelay: '-0.8s' }}
        />
        <path
          d="M54 146 C 26 156, 4 150, 6 130 C 8 116, 20 108, 30 112"
          fill="none"
          stroke="#3a1a22"
          strokeWidth="6"
          strokeDasharray="1 5"
          opacity="0.4"
        />
        <path
          d="M48 156 C 38 128, 44 98, 62 86 L 58 80 L 66 82 L 64 74 L 72 80 L 82 74 L 92 80 L 100 74 L 100 82 L 108 80 L 104 88 C 122 100, 126 130, 116 156 Z"
          fill={`url(#${u}-fur)`}
          stroke="#0b0810"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M64 140 C 70 112, 94 112, 100 140 C 94 150, 70 150, 64 140 Z"
          fill="#857c8c"
          opacity="0.35"
        />
        <path
          d="M56 118 C 66 106, 98 106, 110 118 L 112 146 C 98 156, 68 156, 54 146 Z"
          fill={`url(#${u}-leather)`}
          stroke="#120a06"
          strokeWidth="2.5"
        />
        <path d="M60 112 L 104 150 M104 112 L 92 120" stroke="#2a1a10" strokeWidth="5" />
        <rect
          x="74"
          y="122"
          width="10"
          height="8"
          rx="1"
          fill="#8a7f6a"
          stroke="#1a1410"
          strokeWidth="1.5"
        />
        <path
          d="M58 156 C 56 148, 66 146, 70 154 Z M96 154 C 100 146, 110 148, 108 156 Z"
          fill={`url(#${u}-fur)`}
          stroke="#0b0810"
          strokeWidth="2"
        />
        <path
          d="M58 156 l -3 4 M62 157 l 0 4 M66 156 l 3 4 M100 156 l -3 4 M104 157 l 0 4 M108 156 l 3 4"
          stroke="#e6d6c0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M48 46 C 36 34, 40 14, 58 18 C 70 22, 72 40, 64 52 Z"
          fill={`url(#${u}-fur)`}
          stroke="#0b0810"
          strokeWidth="2.5"
        />
        <path d="M52 42 C 46 34, 48 24, 58 25 C 66 28, 66 38, 62 46 Z" fill={`url(#${u}-ear)`} />
        <path
          d="M116 46 C 128 34, 124 14, 106 18 C 94 22, 92 40, 100 52 Z"
          fill={`url(#${u}-fur)`}
          stroke="#0b0810"
          strokeWidth="2.5"
        />
        <path
          d="M112 42 C 118 34, 116 24, 106 25 C 98 28, 98 38, 102 46 Z"
          fill={`url(#${u}-ear)`}
        />
        <path
          d="M54 66 C 50 48, 66 40, 82 40 C 98 40, 114 48, 110 66 C 108 78, 96 88, 90 98 C 86 104, 78 104, 74 98 C 68 88, 56 78, 54 66 Z"
          fill={`url(#${u}-fur)`}
          stroke="#0b0810"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M70 84 C 74 96, 90 96, 94 84 C 90 92, 74 92, 70 84 Z"
          fill="#1e1a24"
          opacity="0.6"
        />
        <path
          d="M60 62 l -6 -6 M104 62 l 6 -6 M64 56 l -4 -8 M100 56 l 4 -8"
          stroke="#1e1a24"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M57 66 C 70 60, 96 60, 109 66 L 106 78 C 94 74, 72 74, 60 78 Z"
          fill="#1a1420"
          opacity="0.92"
        />
        <circle cx="70" cy="70" r="9" fill={`url(#${u}-eye)`} className="flicker" />
        <circle cx="94" cy="70" r="9" fill={`url(#${u}-eye)`} className="flicker" />
        <ellipse cx="70" cy="70" rx="4" ry="3.4" fill="#2a0404" />
        <ellipse cx="94" cy="70" rx="4" ry="3.4" fill="#2a0404" />
        <circle cx="71.5" cy="68.5" r="1.4" fill="#ffd0c0" />
        <circle cx="95.5" cy="68.5" r="1.4" fill="#ffd0c0" />
        <path
          d="M65 64 L 76 67 M99 64 L 88 67"
          stroke="#0b0810"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M76 100 C 78 96, 86 96, 88 100 C 86 104, 78 104, 76 100 Z"
          fill="#e48a9a"
          stroke="#3a1420"
          strokeWidth="1.5"
        />
        <path
          d="M79 104 l 1 5 l 2 -4 l 2 4 l 1 -5"
          fill="#f4eee0"
          stroke="#3a3020"
          strokeWidth="0.8"
        />
        <g stroke="#e6dccb" strokeWidth="1" opacity="0.8" fill="none">
          <path d="M74 98 Q 56 94 40 96 M74 100 Q 58 102 44 108 M90 98 Q 108 94 124 96 M90 100 Q 106 102 120 108" />
        </g>

        <path
          d="M118 92 L 124 86 L 152 52 C 156 50, 158 52, 156 56 L 128 92 Z"
          fill={`url(#${u}-blade)`}
          stroke="#1a1620"
          strokeWidth="1.5"
        />
        <path d="M112 90 L 128 104" stroke="#3b2316" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M114 100 C 108 92, 122 86, 126 96 C 128 104, 118 108, 114 100 Z"
          fill={`url(#${u}-fur)`}
          stroke="#0b0810"
          strokeWidth="2"
        />
      </svg>
    </span>
  )
}

/** L'Aspirateur, dévoreur d'âmes (adversaire « troll ») : le boss de la crypte. */
export function VacuumSprite() {
  const u = useUid()
  return (
    <svg
      viewBox="0 0 280 300"
      width="100%"
      className="boss"
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`${u}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a4a78" />
          <stop offset="30%" stopColor="#3a2e54" />
          <stop offset="70%" stopColor="#211a32" />
          <stop offset="100%" stopColor="#0c0814" />
        </linearGradient>
        <linearGradient id={`${u}-dome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a7aa8" />
          <stop offset="40%" stopColor="#3e3156" />
          <stop offset="100%" stopColor="#1a1428" />
        </linearGradient>
        <linearGradient id={`${u}-chrome`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d8d4e4" />
          <stop offset="35%" stopColor="#7a7490" />
          <stop offset="60%" stopColor="#f0ecf8" />
          <stop offset="100%" stopColor="#3a3448" />
        </linearGradient>
        <linearGradient id={`${u}-hose`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a5e7e" />
          <stop offset="50%" stopColor="#2e2640" />
          <stop offset="100%" stopColor="#120e1a" />
        </linearGradient>
        <radialGradient id={`${u}-maw`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#d6b8ff" />
          <stop offset="35%" stopColor="#7a3cff" />
          <stop offset="100%" stopColor="#14061e" />
        </radialGradient>
        <radialGradient id={`${u}-eye`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff2c0" />
          <stop offset="35%" stopColor="#ff2d3d" />
          <stop offset="100%" stopColor="#ff2d3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-aura`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#9b6bff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9b6bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-horn`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3a0a16" />
          <stop offset="100%" stopColor="#d8c8a8" />
        </linearGradient>
        <filter id={`${u}-sh`} x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g opacity="0.28">
        <ellipse className="aura" cx="140" cy="180" rx="130" ry="110" fill={`url(#${u}-aura)`} />
      </g>
      <ellipse
        cx="140"
        cy="280"
        rx="96"
        ry="12"
        fill="#000"
        opacity="0.6"
        filter={`url(#${u}-sh)`}
      />
      <g className="hose">
        <path
          d="M74 130 C 18 110, -4 176, 28 214 C 50 240, 34 264, 12 272"
          fill="none"
          stroke="#07050a"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          d="M74 130 C 18 110, -4 176, 28 214 C 50 240, 34 264, 12 272"
          fill="none"
          stroke={`url(#${u}-hose)`}
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M74 130 C 18 110, -4 176, 28 214 C 50 240, 34 264, 12 272"
          fill="none"
          stroke="#9a8cb8"
          strokeWidth="22"
          strokeDasharray="2 7"
          opacity="0.35"
        />
        <path
          d="M-4 256 L 28 262 L 30 276 L 22 294 L -14 288 L -10 270 Z"
          fill={`url(#${u}-chrome)`}
          stroke="#07050a"
          strokeWidth="2.5"
        />
        <path d="M-12 288 L 22 294" stroke="#7a3cff" strokeWidth="5" className="aura" />
        <g fill="#c9b2ff">
          <circle
            className="suck"
            cx="90"
            cy="300"
            r="3"
            style={{ '--sx': '-90px', '--sy': '-8px' } as CSSProperties}
          />
          <circle
            className="suck"
            cx="120"
            cy="296"
            r="2.4"
            style={{ '--sx': '-118px', '--sy': '-2px', animationDelay: '0.7s' } as CSSProperties}
          />
          <circle
            className="suck"
            cx="70"
            cy="300"
            r="2"
            style={{ '--sx': '-66px', '--sy': '-6px', animationDelay: '1.4s' } as CSSProperties}
          />
        </g>
        <g fill="#c9b2ff" opacity="0.8" className="aura">
          <circle cx="-4" cy="298" r="2" />
          <circle cx="10" cy="300" r="1.5" />
          <circle cx="20" cy="297" r="2.5" />
        </g>
      </g>
      <path
        d="M68 252 L 66 124 C 66 70, 214 70, 214 124 L 212 252 C 190 266, 90 266, 68 252 Z"
        fill={`url(#${u}-body)`}
        stroke="#07050a"
        strokeWidth="4"
      />
      <path
        d="M78 140 C 80 100, 110 86, 140 86"
        fill="none"
        stroke="#c9bce0"
        strokeWidth="3"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path d="M66 172 H 214 M68 236 H 212" stroke={`url(#${u}-chrome)`} strokeWidth="8" />
      <g fill={`url(#${u}-chrome)`} stroke="#07050a" strokeWidth="1">
        <circle cx="78" cy="172" r="3.5" />
        <circle cx="110" cy="172" r="3.5" />
        <circle cx="170" cy="172" r="3.5" />
        <circle cx="202" cy="172" r="3.5" />
        <circle cx="80" cy="236" r="3.5" />
        <circle cx="200" cy="236" r="3.5" />
      </g>
      <path
        d="M84 120 C 84 92, 196 92, 196 120 L 194 152 C 160 162, 120 162, 86 152 Z"
        fill={`url(#${u}-dome)`}
        stroke="#07050a"
        strokeWidth="3"
      />
      <path
        d="M92 116 C 100 100, 130 96, 150 98"
        fill="none"
        stroke="#e8e0ff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />
      <ellipse className="aura" cx="114" cy="132" rx="26" ry="16" fill={`url(#${u}-eye)`} />
      <ellipse className="aura" cx="166" cy="132" rx="26" ry="16" fill={`url(#${u}-eye)`} />
      <path d="M96 132 L 134 122 L 130 140 Z" fill="#ff2d3d" stroke="#3a0408" strokeWidth="1.5" />
      <path d="M184 132 L 146 122 L 150 140 Z" fill="#ff2d3d" stroke="#3a0408" strokeWidth="1.5" />
      <path
        d="M98 128 L 124 122 M182 128 L 156 122"
        stroke="#fff0c0"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d="M96 190 C 96 182, 184 182, 184 190 L 176 226 C 150 234, 130 234, 104 226 Z"
        fill={`url(#${u}-maw)`}
        stroke="#07050a"
        strokeWidth="3"
      />
      <path
        d="M100 190 l 8 14 l 8 -12 l 8 14 l 8 -12 l 8 14 l 8 -12 l 8 14 l 8 -12 l 8 14 l 8 -14"
        fill="#f4eee0"
        stroke="#3a3020"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M108 226 l 6 -10 l 6 10 l 6 -10 l 6 10 l 6 -10 l 6 10 l 6 -10 l 6 10 l 6 -10 l 6 10"
        fill="#f4eee0"
        stroke="#3a3020"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <g fill="#e6d6ff" opacity="0.7" className="aura">
        <circle cx="128" cy="212" r="2" />
        <circle cx="146" cy="208" r="2.5" />
        <circle cx="160" cy="214" r="1.6" />
      </g>
      <path
        d="M70 116 C 56 96, 48 72, 56 50 C 64 72, 76 88, 90 98 Z M210 116 C 224 96, 232 72, 224 50 C 216 72, 204 88, 190 98 Z"
        fill={`url(#${u}-horn)`}
        stroke="#07050a"
        strokeWidth="2.5"
      />
      <path
        d="M60 64 l 8 4 M58 80 l 10 4 M220 64 l -8 4 M222 80 l -10 4"
        stroke="#3a0a16"
        strokeWidth="2"
      />
      <g>
        <circle cx="92" cy="258" r="18" fill="#120e1a" stroke="#07050a" strokeWidth="3" />
        <circle cx="92" cy="258" r="11" fill={`url(#${u}-chrome)`} />
        <circle cx="92" cy="258" r="4" fill="#120e1a" />
        <circle cx="188" cy="258" r="18" fill="#120e1a" stroke="#07050a" strokeWidth="3" />
        <circle cx="188" cy="258" r="11" fill={`url(#${u}-chrome)`} />
        <circle cx="188" cy="258" r="4" fill="#120e1a" />
      </g>
      <path
        d="M196 70 L 212 40 M204 74 L 232 60"
        stroke="#9b6bff"
        strokeWidth="2"
        opacity="0.6"
        className="aura"
      />
    </svg>
  )
}

/** Sprite d'un adversaire, choisi d'après son type dans le domaine. */
export function MonsterSprite({ kind }: { kind: string }) {
  if (kind === 'troll') return <VacuumSprite />
  if (kind === 'skeleton') return <SkeletonSprite />
  return <RatSprite />
}
