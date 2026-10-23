/*
 * Décor dessiné en SVG (thème « royaume des chats »). Fichier produit à partir de l'aperçu
 * validé : formes et dégradés seulement, aucune logique. Les couleurs qui changent entre le
 * jour et la nuit sont des variables CSS (--art-…), définies dans app/art.css : le décor suit
 * le thème sans être rendu de nouveau. Les animations sont des classes CSS, coupées par
 * prefers-reduced-motion.
 */
import type { CSSProperties } from 'react'

/** Salle de la taverne : lambris, cheminée, tonneaux et table ronde. */
export function TavernBackdrop() {
  return (
    <svg
      viewBox="0 0 1640 720"
      width="100%"
      className="art-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="t-fire" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9a3a" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#ff7a2a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff7a2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="t-lantern" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffc46a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffc46a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="t-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-tav-sky1)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-tav-sky2)' }} />
        </linearGradient>
        <linearGradient id="t-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="t-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a24" />
          <stop offset="50%" stopColor="#3a2416" />
          <stop offset="100%" stopColor="#1a0e08" />
        </linearGradient>
        <linearGradient id="t-post" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a4428" />
          <stop offset="50%" stopColor="#3a2416" />
          <stop offset="100%" stopColor="#140a04" />
        </linearGradient>
        <linearGradient id="t-stone" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#7a6e7e" />
          <stop offset="100%" stopColor="#3e3644" />
        </linearGradient>
        <linearGradient id="t-hearth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#3a1a0a" />
        </linearGradient>
        <linearGradient id="t-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#140a06" />
          <stop offset="35%" style={{ stopColor: 'var(--art-tav-floor)' }} />
          <stop offset="100%" stopColor="#0e0804" />
        </linearGradient>
        <radialGradient id="t-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9a3a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff9a3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="t-table" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a87444" />
          <stop offset="70%" stopColor="#6b4424" />
          <stop offset="100%" stopColor="#3a2210" />
        </radialGradient>
        <linearGradient id="t-barrel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a2212" />
          <stop offset="35%" stopColor="#8a5a32" />
          <stop offset="65%" stopColor="#6a4224" />
          <stop offset="100%" stopColor="#1e1008" />
        </linearGradient>
        <linearGradient id="t-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a2630" />
          <stop offset="40%" stopColor="#6a6472" />
          <stop offset="100%" stopColor="#1a1820" />
        </linearGradient>
        <linearGradient id="t-mug" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a3a1e" />
          <stop offset="40%" stopColor="#9a6a3c" />
          <stop offset="100%" stopColor="#3a2210" />
        </linearGradient>
        <radialGradient id="t-flame" cx="50%" cy="85%" r="75%">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="30%" stopColor="#ffd06a" />
          <stop offset="70%" stopColor="#ff7a1f" />
          <stop offset="100%" stopColor="#c8300a" />
        </radialGradient>
        <radialGradient id="t-fish" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#f4b27a" />
          <stop offset="100%" stopColor="#a85a2a" />
        </radialGradient>
        <radialGradient id="t-vignette" cx="38%" cy="55%" r="75%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <pattern id="t-planks" width="64" height="480" patternUnits="userSpaceOnUse">
          <path d="M0.5 0 V480" stroke="#000" strokeOpacity="0.45" strokeWidth="2" />
          <path
            d="M20 0 C 24 80, 16 160, 22 240 C 28 320, 18 400, 22 480 M44 0 C 40 120, 48 220, 42 340 C 38 400, 46 440, 44 480"
            stroke="#000"
            strokeOpacity="0.12"
            strokeWidth="1.2"
            fill="none"
          />
          <ellipse cx="32" cy="300" rx="3" ry="6" fill="#000" fillOpacity="0.2" />
        </pattern>
        <filter id="t-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="t-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="3"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
          />
        </filter>
      </defs>

      {/* Murs lambrissés */}
      <rect width="1640" height="720" style={{ fill: 'var(--art-tav-wall)' }} />
      <rect width="1640" height="480" fill="url(#t-planks)" />
      <rect width="1640" height="480" fill="url(#t-wall)" />
      <path d="M0 400 H1640" stroke="#1a0e08" strokeWidth="6" />
      <rect y="400" width="1640" height="80" fill="#000" opacity="0.18" />

      {/* Étagère et bouteilles */}
      <g>
        <path
          d="M720 214 H 960 V 226 H 720 Z"
          fill="url(#t-beam)"
          stroke="#0e0804"
          strokeWidth="2"
        />
        <path d="M740 226 l 10 20 M940 226 l -10 20" stroke="#2a1a10" strokeWidth="5" />
        <g stroke="#0e0804" strokeWidth="1.5">
          <path d="M748 214 v -26 q 0 -8 6 -10 v -10 h 6 v 10 q 6 2 6 10 v 26 z" fill="#2a5a3a" />
          <path d="M776 214 v -18 q 0 -10 10 -12 v -8 h 6 v 8 q 10 2 10 12 v 18 z" fill="#6a1a2a" />
          <path d="M812 214 v -30 q 0 -6 5 -8 v -12 h 5 v 12 q 5 2 5 8 v 30 z" fill="#3a2a6a" />
          <ellipse cx="860" cy="200" rx="18" ry="14" fill="#a8743a" />
          <path d="M846 192 h 28" stroke="#6a4422" />
          <path d="M896 214 v -22 h 22 v 22 z" fill="#d9c9a8" />
          <path d="M898 198 h 18" stroke="#8a6a3a" />
          <path d="M928 214 v -16 q 0 -8 8 -8 q 8 0 8 8 v 16 z" fill="#4a6a8a" />
        </g>
        <g fill="#fff" opacity="0.35">
          <rect x="751" y="192" width="2" height="18" />
          <rect x="780" y="196" width="2" height="14" />
          <rect x="815" y="188" width="2" height="22" />
        </g>
      </g>

      {/* Poutres et poteaux */}
      <g>
        <rect x="0" y="34" width="1640" height="38" fill="url(#t-beam)" />
        <path d="M0 72 H1640" stroke="#0e0804" strokeWidth="3" />
        <rect x="296" y="0" width="36" height="480" fill="url(#t-post)" />
        <rect x="976" y="0" width="36" height="480" fill="url(#t-post)" />
        <path
          d="M296 72 L 240 128 M332 72 L 388 128 M976 72 L 920 128 M1012 72 L 1068 128"
          stroke="url(#t-beam)"
          strokeWidth="18"
        />
        <g fill="#c9a24a" opacity="0.6">
          <circle cx="314" cy="52" r="3" />
          <circle cx="994" cy="52" r="3" />
        </g>
      </g>

      {/* Fenêtre à croisillons */}
      <g>
        <rect x="1080" y="110" width="200" height="170" rx="6" fill="url(#t-window)" />
        <circle cx="1240" cy="150" r="34" opacity="0.18" style={{ fill: 'var(--art-tav-orb)' }} />
        <circle
          cx="1240"
          cy="150"
          r="20"
          style={{ fill: 'var(--art-tav-orb)', opacity: 'var(--art-tav-orbOpacity)' }}
        />
        <path
          d="M1080 250 L 1120 214 L 1150 236 L 1196 196 L 1240 230 L 1280 206 L 1280 280 L 1080 280 Z"
          fill="#000"
          opacity="0.45"
        />
        <path
          d="M1080 152 H1280 M1080 195 H1280 M1080 238 H1280 M1130 110 V280 M1180 110 V280 M1230 110 V280"
          stroke="#1a0e08"
          strokeWidth="3"
          opacity="0.8"
        />
        <path d="M1180 110 V280 M1080 195 H1280" stroke="url(#t-beam)" strokeWidth="9" />
        <rect
          x="1080"
          y="110"
          width="200"
          height="170"
          rx="6"
          fill="none"
          stroke="url(#t-post)"
          strokeWidth="14"
        />
        <path
          d="M1068 288 H 1292 V 300 H 1068 Z"
          fill="url(#t-beam)"
          stroke="#0e0804"
          strokeWidth="2"
        />
        <path d="M1090 120 L 1120 120 L 1090 160 Z" fill="#fff" opacity="0.08" />
      </g>

      {/* Lanternes suspendues */}
      <g>
        <circle className="flicker" cx="180" cy="190" r="110" fill="url(#t-lantern)" />
        <circle
          className="flicker"
          cx="860"
          cy="150"
          r="110"
          fill="url(#t-lantern)"
          style={{ animationDelay: '0.5s' }}
        />
        <path d="M180 72 V 160 M860 72 V 120" stroke="#2a2630" strokeWidth="2" />
        <g stroke="#0e0a08" strokeWidth="2">
          <path
            d="M166 160 h 28 l -4 -8 h -20 z M168 160 h 24 v 34 h -24 z M166 194 h 28 l -4 8 h -20 z"
            fill="url(#t-iron)"
          />
          <path
            d="M846 120 h 28 l -4 -8 h -20 z M848 120 h 24 v 34 h -24 z M846 154 h 28 l -4 8 h -20 z"
            fill="url(#t-iron)"
          />
        </g>
        <g className="flicker" fill="#ffd27a">
          <rect x="172" y="164" width="16" height="26" rx="3" />
          <rect x="852" y="124" width="16" height="26" rx="3" />
        </g>
      </g>

      {/* Cheminée en pierres */}
      <circle className="flicker" cx="520" cy="380" r="300" fill="url(#t-fire)" />
      <g fill="url(#t-stone)" stroke="#16101a" strokeWidth="3">
        <path d="M398 233 Q 422 230 446 233 L 446 267 Q 422 270 398 267 Z" />
        <path d="M450 233 Q 470 230 490 233 L 490 267 Q 470 270 450 267 Z" />
        <path d="M494 233 Q 521 230 548 233 L 548 267 Q 521 270 494 267 Z" />
        <path d="M552 233 Q 574 230 596 233 L 596 267 Q 574 270 552 267 Z" />
        <path d="M600 233 Q 618 230 636 233 L 636 267 Q 618 270 600 267 Z" />
        <path d="M398 273 Q 407 270 416 273 L 416 305 Q 407 308 398 305 Z" />
        <path d="M420 273 Q 447 270 474 273 L 474 305 Q 447 308 420 305 Z" />
        <path d="M478 273 Q 500 270 522 273 L 522 305 Q 500 308 478 305 Z" />
        <path d="M526 273 Q 544 270 562 273 L 562 305 Q 544 308 526 305 Z" />
        <path d="M566 273 Q 591 270 616 273 L 616 305 Q 591 308 566 305 Z" />
        <path d="M620 273 Q 631 270 642 273 L 642 305 Q 631 308 620 305 Z" />
        <path d="M398 311 Q 425 308 452 311 L 452 347 Q 425 350 398 347 Z" />
        <path d="M456 311 Q 478 308 500 311 L 500 347 Q 478 350 456 347 Z" />
        <path d="M504 311 Q 522 308 540 311 L 540 347 Q 522 350 504 347 Z" />
        <path d="M544 311 Q 569 308 594 311 L 594 347 Q 569 350 544 347 Z" />
        <path d="M598 311 Q 619 308 640 311 L 640 347 Q 619 350 598 347 Z" />
        <path d="M398 353 Q 409 350 420 353 L 420 387 Q 409 390 398 387 Z" />
        <path d="M424 353 Q 442 350 460 353 L 460 387 Q 442 390 424 387 Z" />
        <path d="M464 353 Q 489 350 514 353 L 514 387 Q 489 390 464 387 Z" />
        <path d="M518 353 Q 539 350 560 353 L 560 387 Q 539 390 518 387 Z" />
        <path d="M564 353 Q 588 350 612 353 L 612 387 Q 588 390 564 387 Z" />
        <path d="M616 353 Q 629 350 642 353 L 642 387 Q 629 390 616 387 Z" />
        <path d="M398 393 Q 416 390 434 393 L 434 431 Q 416 434 398 431 Z" />
        <path d="M438 393 Q 463 390 488 393 L 488 431 Q 463 434 438 431 Z" />
        <path d="M492 393 Q 513 390 534 393 L 534 431 Q 513 434 492 431 Z" />
        <path d="M538 393 Q 562 390 586 393 L 586 431 Q 562 434 538 431 Z" />
        <path d="M590 393 Q 610 390 630 393 L 630 431 Q 610 434 590 431 Z" />
        <path d="M634 393 Q 638 390 642 393 L 642 431 Q 638 434 634 431 Z" />
        <path d="M398 437 Q 412 434 426 437 L 426 477 Q 412 480 398 477 Z" />
        <path d="M430 437 Q 451 434 472 437 L 472 477 Q 451 480 430 477 Z" />
        <path d="M476 437 Q 500 434 524 437 L 524 477 Q 500 480 476 477 Z" />
        <path d="M528 437 Q 548 434 568 437 L 568 477 Q 548 480 528 477 Z" />
        <path d="M572 437 Q 599 434 626 437 L 626 477 Q 599 480 572 477 Z" />
        <path d="M630 437 Q 636 434 642 437 L 642 477 Q 636 480 630 477 Z" />
      </g>
      <path
        d="M374 196 L 666 196 L 672 232 L 368 232 Z"
        fill="url(#t-beam)"
        stroke="#0e0804"
        strokeWidth="3"
      />
      <path d="M368 232 H 672" stroke="#000" strokeWidth="4" opacity="0.5" />
      <g stroke="#0e0804" strokeWidth="1.5">
        <rect x="404" y="164" width="12" height="32" rx="2" fill="#efe2c4" />
        <rect x="424" y="174" width="12" height="22" rx="2" fill="#efe2c4" />
        <path d="M600 196 c -4 -18 6 -30 16 -32 c 10 2 20 14 16 32 z" fill="#5a3a7a" />
        <path d="M518 196 c 0 -16 30 -16 30 0 z" fill="#c9a24a" />
      </g>
      <g className="flicker" fill="#ffd27a">
        <path d="M410 164 q -4 -8 0 -14 q 4 6 0 14 z" />
        <path d="M430 174 q -4 -8 0 -14 q 4 6 0 14 z" />
      </g>
      <path
        d="M436 480 L 436 336 C 436 296, 604 296, 604 336 L 604 480 Z"
        fill="url(#t-hearth)"
        stroke="#16101a"
        strokeWidth="4"
      />
      <path
        d="M436 336 C 436 296, 604 296, 604 336"
        fill="none"
        stroke="#2a1a10"
        strokeWidth="10"
        opacity="0.6"
      />
      <g stroke="#0e0804" strokeWidth="2">
        <path d="M456 470 C 470 456, 548 456, 586 470 L 584 480 L 458 480 Z" fill="#3a2212" />
        <ellipse cx="470" cy="470" rx="6" ry="8" fill="#8a5a32" />
        <ellipse cx="572" cy="470" rx="6" ry="8" fill="#8a5a32" />
      </g>
      <g className="fire">
        <path
          d="M470 470 C 456 420, 494 404, 488 356 C 514 384, 538 400, 532 440 C 540 420, 552 410, 552 390 C 574 420, 572 450, 566 470 Z"
          fill="url(#t-flame)"
        />
        <path
          d="M496 470 C 490 440, 512 426, 510 398 C 530 420, 544 440, 540 470 Z"
          fill="#fff0b0"
          opacity="0.8"
        />
      </g>
      <ellipse
        cx="520"
        cy="472"
        rx="80"
        ry="8"
        fill="#ffb84d"
        opacity="0.4"
        filter="url(#t-blur)"
      />
      <g fill="#ffe08a">
        <circle
          className="crackle"
          cx="500"
          cy="440"
          r="1.8"
          style={{ '--dx': '-20px' } as CSSProperties}
        />
        <circle
          className="crackle"
          cx="530"
          cy="430"
          r="1.5"
          style={{ '--dx': '14px', animationDelay: '0.5s' } as CSSProperties}
        />
        <circle
          className="crackle"
          cx="516"
          cy="446"
          r="1.6"
          style={{ '--dx': '-6px', animationDelay: '0.9s' } as CSSProperties}
        />
        <circle
          className="crackle"
          cx="540"
          cy="440"
          r="1.2"
          style={{ '--dx': '22px', animationDelay: '1.2s' } as CSSProperties}
        />
      </g>
      <g fill="#ffb84d">
        <circle className="ember" cx="500" cy="440" r="2.5" />
        <circle className="ember" cx="530" cy="450" r="2" style={{ animationDelay: '1.3s' }} />
        <circle className="ember" cx="515" cy="430" r="2" style={{ animationDelay: '2.5s' }} />
        <circle className="ember" cx="545" cy="436" r="1.8" style={{ animationDelay: '3.1s' }} />
      </g>
      <g stroke="#0e0804" strokeWidth="2.5">
        <path d="M620 476 L 640 476 L 650 400 L 628 400 Z" fill="url(#t-iron)" />
        <path d="M626 406 l -14 -40 M640 406 l 8 -46" stroke="#4a4452" strokeWidth="4" />
      </g>
      <g stroke="#0e0804" strokeWidth="2">
        <ellipse cx="672" cy="474" rx="30" ry="8" fill="#3a2212" />
        <ellipse cx="660" cy="464" rx="30" ry="8" fill="#5a3a20" />
        <ellipse cx="686" cy="462" rx="6" ry="8" fill="#a87444" />
      </g>

      {/* Tonneaux cerclés */}
      <g>
        <ellipse
          cx="200"
          cy="500"
          rx="120"
          ry="14"
          fill="#000"
          opacity="0.5"
          filter="url(#t-blur)"
        />
        <path
          d="M110 498 C 98 460, 98 400, 110 362 L 210 362 C 222 400, 222 460, 210 498 Z"
          fill="url(#t-barrel)"
          stroke="#0e0804"
          strokeWidth="3"
        />
        <path
          d="M108 378 C 140 384, 180 384, 212 378 M104 430 C 140 436, 180 436, 216 430 M108 484 C 140 490, 180 490, 212 484"
          fill="none"
          stroke="url(#t-iron)"
          strokeWidth="7"
        />
        <ellipse
          cx="160"
          cy="362"
          rx="50"
          ry="10"
          fill="#5a3a20"
          stroke="#0e0804"
          strokeWidth="3"
        />
        <path
          d="M130 362 v 136 M160 364 v 136 M190 362 v 136"
          stroke="#000"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        <path
          d="M210 500 C 200 470, 200 430, 210 402 L 290 402 C 300 430, 300 470, 290 500 Z"
          fill="url(#t-barrel)"
          stroke="#0e0804"
          strokeWidth="3"
        />
        <path
          d="M208 414 C 236 420, 264 420, 292 414 M206 452 C 236 458, 264 458, 294 452 M208 490 C 236 496, 264 496, 292 490"
          fill="none"
          stroke="url(#t-iron)"
          strokeWidth="6"
        />
        <ellipse cx="250" cy="402" rx="40" ry="8" fill="#5a3a20" stroke="#0e0804" strokeWidth="3" />
        <path d="M246 456 h 14 v 8 h -14 z" fill="#8a7f6a" stroke="#0e0804" strokeWidth="1.5" />
      </g>

      {/* Plancher en perspective */}
      <path d="M0 480 L 1640 480 L 1640 720 L 0 720 Z" fill="url(#t-floor)" />
      <path
        d="M-736 480 L -1600 720 M-670 480 L -1490 720 M-604 480 L -1380 720 M-538 480 L -1270 720 M-472 480 L -1160 720 M-406 480 L -1050 720 M-340 480 L -940 720 M-274 480 L -830 720 M-208 480 L -720 720 M-142 480 L -610 720 M-76 480 L -500 720 M-10 480 L -390 720 M56 480 L -280 720 M122 480 L -170 720 M188 480 L -60 720 M254 480 L 50 720 M320 480 L 160 720 M386 480 L 270 720 M452 480 L 380 720 M518 480 L 490 720 M584 480 L 600 720 M650 480 L 710 720 M716 480 L 820 720 M782 480 L 930 720 M848 480 L 1040 720 M914 480 L 1150 720 M980 480 L 1260 720 M1046 480 L 1370 720 M1112 480 L 1480 720 M1178 480 L 1590 720 M1244 480 L 1700 720 M1310 480 L 1810 720 M1376 480 L 1920 720 M1442 480 L 2030 720 M1508 480 L 2140 720 M1574 480 L 2250 720 M1640 480 L 2360 720 M1706 480 L 2470 720 M1772 480 L 2580 720 M1838 480 L 2690 720 M1904 480 L 2800 720 M1970 480 L 2910 720 M2036 480 L 3020 720 M2102 480 L 3130 720 M2168 480 L 3240 720 M2234 480 L 3350 720"
        stroke="#000"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M0 520 H 420 M760 560 H 1640 M0 640 H 300 M900 660 H 1640"
        stroke="#000"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <ellipse cx="520" cy="540" rx="420" ry="90" fill="url(#t-pool)" />

      {/* Table ronde */}
      <ellipse
        cx="560"
        cy="650"
        rx="280"
        ry="40"
        fill="#000"
        opacity="0.55"
        filter="url(#t-blur)"
      />
      <path
        d="M540 640 L 534 690 L 586 690 L 580 640 Z"
        fill="url(#t-barrel)"
        stroke="#0e0804"
        strokeWidth="3"
      />
      <ellipse cx="560" cy="614" rx="262" ry="60" fill="#3a2212" stroke="#0e0804" strokeWidth="4" />
      <ellipse
        cx="560"
        cy="602"
        rx="262"
        ry="58"
        fill="url(#t-table)"
        stroke="#0e0804"
        strokeWidth="4"
      />
      <g fill="none" stroke="#2a1608" strokeOpacity="0.45" strokeWidth="1.5">
        <ellipse cx="560" cy="602" rx="200" ry="42" />
        <ellipse cx="560" cy="602" rx="130" ry="28" />
        <path d="M330 600 C 420 590, 700 616, 790 596" />
      </g>
      <path
        d="M340 586 C 420 560, 520 552, 620 556"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        opacity="0.12"
        strokeLinecap="round"
      />
      <g>
        <ellipse
          cx="580"
          cy="612"
          rx="58"
          ry="14"
          fill="#d9d2c4"
          stroke="#5a5048"
          strokeWidth="2"
        />
        <path
          d="M538 610 C 556 592, 600 592, 610 606 L 628 596 L 624 620 L 608 614 C 592 628, 556 628, 538 610 Z"
          fill="url(#t-fish)"
          stroke="#5a2a0a"
          strokeWidth="2"
        />
        <path
          d="M572 600 q 6 10 0 20 M586 600 q 6 10 0 20"
          stroke="#8a3a12"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        <circle cx="550" cy="606" r="2.5" fill="#1a0a04" />
      </g>
      <g stroke="#0e0804" strokeWidth="2.5">
        <g transform="translate(430 568)">
          <path d="M0 0 h 24 v 30 q -12 5 -24 0 z" fill="url(#t-mug)" />
          <path d="M24 6 q 12 0 12 10 q 0 10 -12 10" fill="none" strokeWidth="4" />
          <path d="M0 8 h 24 M0 22 h 24" stroke="url(#t-iron)" strokeWidth="3" />
          <ellipse cx="12" cy="0" rx="13" ry="5" fill="#fff6e0" />
        </g>
        <g transform="translate(520 560)">
          <path d="M0 0 h 24 v 30 q -12 5 -24 0 z" fill="url(#t-mug)" />
          <path d="M24 6 q 12 0 12 10 q 0 10 -12 10" fill="none" strokeWidth="4" />
          <path d="M0 8 h 24 M0 22 h 24" stroke="url(#t-iron)" strokeWidth="3" />
          <ellipse cx="12" cy="0" rx="13" ry="5" fill="#fff6e0" />
        </g>
        <g transform="translate(650 566)">
          <path d="M0 0 h 24 v 30 q -12 5 -24 0 z" fill="url(#t-mug)" />
          <path d="M0 6 q -12 0 -12 10 q 0 10 12 10" fill="none" strokeWidth="4" />
          <path d="M0 8 h 24 M0 22 h 24" stroke="url(#t-iron)" strokeWidth="3" />
          <ellipse cx="12" cy="0" rx="13" ry="5" fill="#fff6e0" />
        </g>
        <g transform="translate(720 588)">
          <path d="M0 0 h 22 v 26 q -11 4 -22 0 z" fill="#d9d2c4" />
          <ellipse cx="11" cy="0" rx="11" ry="4" fill="#f4f2ea" />
        </g>
      </g>
      <g fill="#fff">
        <rect className="glint" x="434" y="574" width="3" height="20" rx="1.5" />
        <rect
          className="glint"
          x="524"
          y="566"
          width="3"
          height="20"
          rx="1.5"
          style={{ animationDelay: '1s' }}
        />
        <rect
          className="glint"
          x="654"
          y="572"
          width="3"
          height="20"
          rx="1.5"
          style={{ animationDelay: '2s' }}
        />
      </g>
      <g fill="#fff" opacity="0.5">
        <circle className="steam" cx="442" cy="560" r="6" />
        <circle className="steam" cx="532" cy="552" r="6" style={{ animationDelay: '0.9s' }} />
        <circle className="steam" cx="662" cy="558" r="6" style={{ animationDelay: '1.7s' }} />
      </g>
      <g transform="translate(400 600)">
        <path d="M0 0 h 10 v -18 h -10 z" fill="#efe2c4" stroke="#0e0804" strokeWidth="1.5" />
        <path className="flicker" d="M5 -18 q -4 -8 0 -14 q 4 6 0 14 z" fill="#ffd27a" />
      </g>

      <rect width="1640" height="720" filter="url(#t-grain)" opacity="0.18" />
      <rect width="1640" height="720" fill="url(#t-vignette)" />
    </svg>
  )
}
