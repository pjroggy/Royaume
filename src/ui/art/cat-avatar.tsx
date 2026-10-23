/**
 * Chat du royaume, dessiné en SVG : pelage, regard et équipement sont des propriétés.
 * Ce composant n'a ni état ni effet : il s'affiche aussi bien sur le serveur que dans le
 * navigateur. Les dégradés reçoivent un identifiant unique (useId), car plusieurs chats
 * peuvent figurer sur la même page.
 *
 * Les emplacements d'équipement (casque, armure, arme, cape) préparent la Forge : un objet
 * forgé n'aura qu'à fixer ces propriétés, sans toucher au dessin.
 */
import { useId } from 'react'
import { luminance, shade } from './color'

export type CatPose = 'idle' | 'attack' | 'hit'

export interface CatLook {
  fur?: string
  belly?: string
  eyes?: string
  capeColor?: string
  kitten?: boolean
  helmet?: boolean
  armor?: boolean
  weapon?: boolean
  cape?: boolean
}

export interface CatAvatarProps extends CatLook {
  /** Largeur en pixels ; la hauteur en découle. */
  size?: number
  /** Regarde vers la gauche. */
  flip?: boolean
  pose?: CatPose
  /** Texte lu par les lecteurs d'écran ; vide pour un chat purement décoratif. */
  label: string
}

/** Un chat chevalier, ou un chaton écuyer, avec son équipement. */
export function CatAvatar({
  fur = '#d9803a',
  belly = '#f6e3c6',
  eyes = '#ffb23f',
  capeColor = '#6a1a2a',
  kitten = false,
  helmet = true,
  armor = true,
  weapon = true,
  cape = true,
  size = 200,
  flip = false,
  pose = 'idle',
  label,
}: CatAvatarProps) {
  // Les identifiants produits par useId contiennent des « : », interdits dans url(#...).
  const uid = useId().replace(/:/g, '')
  const dark = luminance(fur) < 0.3
  const show = (visible: boolean) => (visible ? 'inline' : 'none')
  const eyeScale = (cx: number) =>
    kitten ? `translate(${cx} 79) scale(1.22) translate(${-cx} -79)` : 'translate(0 0)'
  const c = {
    fur,
    furLight: shade(fur, dark ? 0.28 : 0.35),
    furDark: shade(fur, -0.42),
    line: shade(fur, -0.6),
    bellyLight: shade(belly, 0.4),
    bellyDark: shade(belly, -0.18),
    eyes,
    eyeLight: shade(eyes, 0.55),
    eyeDark: shade(eyes, -0.5),
    cape: capeColor,
    capeDark: shade(capeColor, -0.55),
    stripes: dark ? 0 : 0.42,
  }
  const helmetDisplay = show(helmet)
  const armorDisplay = show(armor)
  const weaponDisplay = show(weapon)
  const capeDisplay = show(cape)
  const pupilRx = kitten ? 3.4 : 2.4
  const pupilRy = kitten ? 7.5 : 7
  const eyeLeft = eyeScale(79)
  const eyeRight = eyeScale(121)
  const headTransform = kitten ? 'translate(-14 6) scale(1.14)' : 'translate(0 0)'
  const flipTransform = flip ? 'translate(200 0) scale(-1 1)' : 'translate(0 0)'
  const poseClass = pose === 'attack' ? 'k-attack' : pose === 'hit' ? 'k-hit' : ''

  return (
    <span className="cat" style={{ width: size, height: Math.round(size * 1.1) }}>
      <svg
        viewBox="0 0 200 220"
        width="100%"
        height="100%"
        role={label ? 'img' : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
      >
        <title>{label}</title>
        <defs>
          <radialGradient id={`kf-${uid}`} cx="38%" cy="28%" r="80%">
            <stop offset="0%" stopColor={c.furLight} />
            <stop offset="55%" stopColor={c.fur} />
            <stop offset="100%" stopColor={c.furDark} />
          </radialGradient>
          <radialGradient id={`kb-${uid}`} cx="45%" cy="25%" r="85%">
            <stop offset="0%" stopColor={c.bellyLight} />
            <stop offset="100%" stopColor={c.bellyDark} />
          </radialGradient>
          <radialGradient id={`ki-${uid}`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor={c.eyeLight} />
            <stop offset="60%" stopColor={c.eyes} />
            <stop offset="100%" stopColor={c.eyeDark} />
          </radialGradient>
          <radialGradient id={`kg-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.eyes} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c.eyes} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`kp-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6bcc6" />
            <stop offset="100%" stopColor="#c47584" />
          </linearGradient>
          <linearGradient id={`ks-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9c7d6" />
            <stop offset="45%" stopColor="#6c6979" />
            <stop offset="100%" stopColor="#26232e" />
          </linearGradient>
          <linearGradient id={`ko-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe29a" />
            <stop offset="100%" stopColor="#9c6a22" />
          </linearGradient>
          <linearGradient id={`kl-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d9d6e6" />
            <stop offset="100%" stopColor="#8f8aa6" />
          </linearGradient>
          <linearGradient id={`kc-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.cape} />
            <stop offset="100%" stopColor={c.capeDark} />
          </linearGradient>
          <linearGradient id={`kh-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3ead6" />
            <stop offset="100%" stopColor="#9d8e72" />
          </linearGradient>
          <filter id={`kblur-${uid}`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g transform={flipTransform}>
          <ellipse
            cx="100"
            cy="205"
            rx="62"
            ry="9"
            fill="#000"
            opacity="0.45"
            filter={`url(#kblur-${uid})`}
          />
          <g className={poseClass}>
            <g className="k-body">
              {/* Cape */}
              <g display={capeDisplay}>
                <path
                  className="k-cape"
                  d="M66 134 C 48 160, 44 188, 50 206 C 80 212, 120 212, 150 206 C 156 188, 152 160, 134 134 Z"
                  fill={`url(#kc-${uid})`}
                  stroke={c.capeDark}
                  strokeWidth="2"
                />
                <path
                  d="M70 160 Q 64 184 68 206 M100 150 Q 96 182 100 210 M130 160 Q 136 184 132 206"
                  fill="none"
                  stroke="#000"
                  strokeOpacity="0.28"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
              {/* Queue touffue */}
              <path
                className="k-tail"
                d="M134 188 C 168 188, 186 160, 178 126 C 174 108, 158 102, 152 110 C 147 117, 158 126, 160 140 C 164 162, 150 174, 130 176 Z"
                fill={`url(#kf-${uid})`}
                stroke={c.line}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M168 118 Q 172 128 170 140 M162 150 Q 166 156 160 166"
                fill="none"
                stroke={c.furDark}
                strokeWidth="4"
                strokeLinecap="round"
                opacity={c.stripes}
              />
              {/* Corps et hanches */}
              <path
                d="M62 198 C 50 176, 52 146, 70 132 C 82 123, 118 123, 130 132 C 148 146, 150 176, 138 198 Z"
                fill={`url(#kf-${uid})`}
                stroke={c.line}
                strokeWidth="2"
              />
              <path
                d="M58 198 C 46 186, 48 160, 66 154 C 80 150, 88 172, 84 198 Z"
                fill={c.furDark}
                opacity="0.35"
              />
              <path
                d="M142 198 C 154 186, 152 160, 134 154 C 120 150, 112 172, 116 198 Z"
                fill={c.furDark}
                opacity="0.35"
              />
              <path
                d="M62 170 Q 70 166 74 172 M64 182 Q 72 178 76 184 M138 170 Q 130 166 126 172 M136 182 Q 128 178 124 184"
                fill="none"
                stroke={c.furDark}
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity={c.stripes}
              />
              {/* Plastron de fourrure */}
              <path
                d="M78 132 C 86 127, 114 127, 122 132 L 120 150 L 127 158 L 116 160 L 120 171 L 108 168 L 106 181 L 100 172 L 94 181 L 92 168 L 80 171 L 84 160 L 73 158 L 80 150 Z"
                fill={`url(#kb-${uid})`}
              />
              {/* Armure */}
              <g display={armorDisplay}>
                <path
                  d="M72 136 C 84 128, 116 128, 128 136 L 130 168 C 120 183, 80 183, 70 168 Z"
                  fill={`url(#ks-${uid})`}
                  stroke="#16131c"
                  strokeWidth="2"
                />
                <path
                  d="M76 141 C 87 134, 113 134, 124 141 M74 166 C 86 177, 114 177, 126 166"
                  fill="none"
                  stroke={`url(#ko-${uid})`}
                  strokeWidth="2.5"
                />
                <path
                  d="M100 136 L 110 152 L 100 170 L 90 152 Z"
                  fill="#a3122a"
                  stroke={`url(#ko-${uid})`}
                  strokeWidth="2"
                />
                <path d="M100 140 L 105 152 L 100 148 Z" fill="#ff8a9a" opacity="0.8" />
                <path
                  d="M58 142 C 54 128, 70 118, 86 124 C 82 134, 72 144, 58 142 Z M142 142 C 146 128, 130 118, 114 124 C 118 134, 128 144, 142 142 Z"
                  fill={`url(#ks-${uid})`}
                  stroke="#16131c"
                  strokeWidth="2"
                />
                <g fill={`url(#ko-${uid})`}>
                  <circle cx="78" cy="148" r="2" />
                  <circle cx="122" cy="148" r="2" />
                  <circle cx="80" cy="162" r="2" />
                  <circle cx="120" cy="162" r="2" />
                </g>
              </g>
              <g display={capeDisplay} fill={`url(#ko-${uid})`} stroke="#5a3a12" strokeWidth="1">
                <circle cx="72" cy="134" r="4.5" />
                <circle cx="128" cy="134" r="4.5" />
              </g>
              {/* Pattes avant */}
              <path
                d="M80 160 C 78 176, 76 188, 76 199 L 95 199 C 95 186, 95 172, 97 160 Z"
                fill={`url(#kf-${uid})`}
                stroke={c.line}
                strokeWidth="1.6"
              />
              <path
                d="M120 160 C 122 176, 124 188, 124 199 L 105 199 C 105 186, 105 172, 103 160 Z"
                fill={`url(#kf-${uid})`}
                stroke={c.line}
                strokeWidth="1.6"
              />
              <ellipse
                cx="85"
                cy="201"
                rx="13"
                ry="7"
                fill={`url(#kb-${uid})`}
                stroke={c.line}
                strokeWidth="1.6"
              />
              <ellipse
                cx="115"
                cy="201"
                rx="13"
                ry="7"
                fill={`url(#kb-${uid})`}
                stroke={c.line}
                strokeWidth="1.6"
              />
              <path
                d="M80 199 l 0 4 M86 199 l 0 4 M110 199 l 0 4 M116 199 l 0 4"
                stroke={c.line}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Arme */}
              <g display={weaponDisplay}>
                <g className="k-blade">
                  <path
                    d="M154 54 L 161 70 L 160 156 L 148 156 L 147 70 Z"
                    fill={`url(#kl-${uid})`}
                    stroke="#2a2633"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M154 70 L 154 150" stroke="#8f8aa6" strokeWidth="1.6" />
                  <path
                    className="k-glow"
                    d="M159 72 L 158 152"
                    stroke="#ff8a3d"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M134 156 C 144 150, 164 150, 174 156 C 164 163, 144 163, 134 156 Z"
                    fill={`url(#ko-${uid})`}
                    stroke="#5a3a12"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="150"
                    y="160"
                    width="8"
                    height="22"
                    rx="3"
                    fill="#4a2c1a"
                    stroke="#1e110a"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M150 165 l 8 3 M150 171 l 8 3 M150 177 l 8 3"
                    stroke="#7a4a2a"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="154"
                    cy="186"
                    r="5"
                    fill="#a3122a"
                    stroke={`url(#ko-${uid})`}
                    strokeWidth="2"
                  />
                </g>
                <ellipse
                  cx="154"
                  cy="172"
                  rx="11"
                  ry="9"
                  fill={`url(#kf-${uid})`}
                  stroke={c.line}
                  strokeWidth="1.6"
                />
              </g>
              {/* Tête */}
              <g transform={headTransform}>
                <path
                  className="k-ear-l"
                  d="M56 66 C 52 44, 50 24, 58 9 C 72 19, 86 31, 93 40 Z"
                  fill={`url(#kf-${uid})`}
                  stroke={c.line}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M62 57 C 60 43, 60 30, 63 20 C 72 28, 80 36, 85 42 Z"
                  fill={`url(#kp-${uid})`}
                />
                <path
                  d="M64 50 l 7 -7 M66 56 l 9 -5 M63 44 l 5 -8"
                  stroke={c.bellyLight}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M144 66 C 148 44, 150 24, 142 9 C 128 19, 114 31, 107 40 Z"
                  fill={`url(#kf-${uid})`}
                  stroke={c.line}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M138 57 C 140 43, 140 30, 137 20 C 128 28, 120 36, 115 42 Z"
                  fill={`url(#kp-${uid})`}
                />
                <path
                  d="M136 50 l -7 -7 M134 56 l -9 -5 M137 44 l -5 -8"
                  stroke={c.bellyLight}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M52 62 C 50 40, 70 28, 100 28 C 130 28, 150 40, 148 62 C 156 72, 160 84, 154 94 L 163 100 L 151 102 L 159 110 L 144 111 C 134 123, 118 129, 100 129 C 82 129, 66 123, 56 111 L 41 110 L 49 102 L 37 100 L 46 94 C 40 84, 44 72, 52 62 Z"
                  fill={`url(#kf-${uid})`}
                  stroke={c.line}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M100 32 L 100 52 M89 35 Q 91 45 94 54 M111 35 Q 109 45 106 54 M50 76 Q 58 78 62 84 M150 76 Q 142 78 138 84"
                  fill="none"
                  stroke={c.furDark}
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity={c.stripes}
                />
                <ellipse cx="88" cy="99" rx="15" ry="11" fill={`url(#kb-${uid})`} />
                <ellipse cx="112" cy="99" rx="15" ry="11" fill={`url(#kb-${uid})`} />
                <ellipse cx="100" cy="110" rx="9" ry="6" fill={`url(#kb-${uid})`} />
                {/* Casque à cornes */}
                <g display={helmetDisplay} transform="translate(0 -10)">
                  <path
                    d="M54 50 C 36 44, 25 28, 29 8 C 38 23, 48 31, 65 37 Z"
                    fill={`url(#kh-${uid})`}
                    stroke="#4a3f2c"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M146 50 C 164 44, 175 28, 171 8 C 162 23, 152 31, 135 37 Z"
                    fill={`url(#kh-${uid})`}
                    stroke="#4a3f2c"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M50 70 C 48 44, 70 26, 100 26 C 130 26, 152 44, 150 70 C 140 62, 124 57, 100 57 C 76 57, 60 62, 50 70 Z"
                    fill={`url(#ks-${uid})`}
                    stroke="#16131c"
                    strokeWidth="2"
                  />
                  <path
                    d="M50 70 C 66 60, 134 60, 150 70 L 148 77 C 132 67, 68 67, 52 77 Z"
                    fill="#2a2633"
                    stroke={`url(#ko-${uid})`}
                    strokeWidth="1.8"
                  />
                  <path d="M100 27 L 100 57" stroke={`url(#ko-${uid})`} strokeWidth="3" />
                  <path
                    d="M96 57 L 104 57 L 102.5 80 L 97.5 80 Z"
                    fill={`url(#ks-${uid})`}
                    stroke="#16131c"
                    strokeWidth="1.5"
                  />
                  <g fill={`url(#ko-${uid})`}>
                    <circle cx="64" cy="69" r="1.8" />
                    <circle cx="82" cy="65" r="1.8" />
                    <circle cx="118" cy="65" r="1.8" />
                    <circle cx="136" cy="69" r="1.8" />
                  </g>
                  <path
                    d="M68 40 C 80 32, 96 30, 110 31"
                    fill="none"
                    stroke="#fff"
                    strokeOpacity="0.35"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
                {/* Yeux en amande */}
                <circle className="k-glow" cx="79" cy="79" r="20" fill={`url(#kg-${uid})`} />
                <circle className="k-glow" cx="121" cy="79" r="20" fill={`url(#kg-${uid})`} />
                <g className="k-eye">
                  <g transform={eyeLeft}>
                    <path
                      d="M65 80 Q 78 61 94 78 Q 79 95 65 80 Z"
                      fill={`url(#ki-${uid})`}
                      stroke={c.line}
                      strokeWidth="1.6"
                    />
                    <ellipse cx="80" cy="79" rx={pupilRx} ry={pupilRy} fill="#0c0a10" />
                    <circle cx="76" cy="74.5" r="2.6" fill="#fff" />
                    <circle cx="84" cy="83" r="1.2" fill="#fff" opacity="0.7" />
                    <path
                      d="M63 79 Q 78 59 96 77"
                      fill="none"
                      stroke={c.line}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
                <g className="k-eye">
                  <g transform={eyeRight}>
                    <path
                      d="M106 78 Q 122 61 135 80 Q 121 95 106 78 Z"
                      fill={`url(#ki-${uid})`}
                      stroke={c.line}
                      strokeWidth="1.6"
                    />
                    <ellipse cx="120" cy="79" rx={pupilRx} ry={pupilRy} fill="#0c0a10" />
                    <circle cx="116" cy="74.5" r="2.6" fill="#fff" />
                    <circle cx="124" cy="83" r="1.2" fill="#fff" opacity="0.7" />
                    <path
                      d="M104 77 Q 122 59 137 79"
                      fill="none"
                      stroke={c.line}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
                {/* Museau */}
                <path
                  d="M94 92 Q 100 88.5 106 92 Q 103.5 97.5 100 98.5 Q 96.5 97.5 94 92 Z"
                  fill={`url(#kp-${uid})`}
                  stroke={c.line}
                  strokeWidth="1"
                />
                <path
                  d="M100 98.5 L 100 102 M93 103 Q 97 107 100 102 Q 103 107 107 103"
                  fill="none"
                  stroke={c.line}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <g fill={c.line} opacity="0.6">
                  <circle cx="88" cy="100" r="1" />
                  <circle cx="84" cy="104" r="1" />
                  <circle cx="112" cy="100" r="1" />
                  <circle cx="116" cy="104" r="1" />
                </g>
                <path
                  d="M84 100 Q 62 93 38 96 M84 104 Q 62 104 40 109 M116 100 Q 138 93 162 96 M116 104 Q 138 104 160 109"
                  fill="none"
                  stroke="#f6f1e6"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </span>
  )
}
