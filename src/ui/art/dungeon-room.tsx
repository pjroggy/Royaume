/*
 * Décor dessiné en SVG (thème « royaume des chats »). Fichier produit à partir de l'aperçu
 * validé : formes et dégradés seulement, aucune logique. Les couleurs qui changent entre le
 * jour et la nuit sont des variables CSS (--art-…), définies dans app/art.css : le décor suit
 * le thème sans être rendu de nouveau. Les animations sont des classes CSS, coupées par
 * prefers-reduced-motion.
 */

/** Salle de la crypte : murs, arches, torches et sol dallé. */
export function DungeonBackdrop() {
  return (
    <svg
      viewBox="0 0 1640 720"
      width="100%"
      className="art-svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="d-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-dun-wall1)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-dun-wall2)' }} />
        </linearGradient>
        <linearGradient id="d-block" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="d-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--art-dun-floor2)' }} />
          <stop offset="40%" style={{ stopColor: 'var(--art-dun-floor1)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--art-dun-floor2)' }} />
        </linearGradient>
        <linearGradient id="d-pillar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a3f5a" />
          <stop offset="45%" stopColor="#2e2640" />
          <stop offset="100%" stopColor="#0e0a14" />
        </linearGradient>
        <radialGradient id="d-deep" cx="50%" cy="70%" r="70%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="70%" stopColor="#07050b" />
          <stop offset="100%" stopColor="#1c1526" />
        </radialGradient>
        <linearGradient id="d-banner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a0a16" />
          <stop offset="25%" stopColor="#7a1a2e" />
          <stop offset="45%" stopColor="#4a0e1c" />
          <stop offset="70%" stopColor="#82202f" />
          <stop offset="100%" stopColor="#2a0610" />
        </linearGradient>
        <linearGradient id="d-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a5262" />
          <stop offset="50%" stopColor="#2a2430" />
          <stop offset="100%" stopColor="#121016" />
        </linearGradient>
        <radialGradient id="d-flame" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="35%" stopColor="#ffd06a" />
          <stop offset="75%" stopColor="#ff7a1f" />
          <stop offset="100%" stopColor="#b8300a" />
        </radialGradient>
        <radialGradient id="d-torch" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9a3d" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#ff7a2a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ff7a2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffae5a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffae5a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d-arcane" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9b6bff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#9b6bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d-vignette" cx="40%" cy="55%" r="75%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.88" />
        </radialGradient>
        <radialGradient id="d-bone" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f4ead2" />
          <stop offset="100%" stopColor="#9a8c6e" />
        </radialGradient>
        <filter id="d-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="d-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
          />
        </filter>
      </defs>

      {/* Mur de pierres taillées */}
      <rect width="1640" height="460" fill="url(#d-wall)" />
      <g fill="url(#d-block)" stroke="#07050a" strokeWidth="3" strokeLinejoin="round">
        <path d="M4 3.1 Q 59 -0.5 114 5 L 115 69 Q 59 70.8 5 70 Z" />
        <path d="M122 3.7 Q 191 0.5 260 5 L 261 69 Q 191 71.6 123 70 Z" />
        <path d="M268 4.3 Q 330 1.5 392 5 L 393 69 Q 330 72.4 269 70 Z" />
        <path d="M400 4.9 Q 476 2.5 552 5 L 553 69 Q 476 73.2 401 70 Z" />
        <path d="M560 3.4 Q 618 0.0 676 5 L 677 69 Q 618 71.2 561 70 Z" />
        <path d="M684 4.0 Q 755 1.0 826 5 L 827 69 Q 755 72.0 685 70 Z" />
        <path d="M834 4.6 Q 899 2.0 964 5 L 965 69 Q 899 72.8 835 70 Z" />
        <path d="M972 3.1 Q 1024 -0.5 1076 5 L 1077 69 Q 1024 70.8 973 70 Z" />
        <path d="M1084 3.7 Q 1158 0.5 1232 5 L 1233 69 Q 1158 71.6 1085 70 Z" />
        <path d="M1240 4.3 Q 1300 1.5 1360 5 L 1361 69 Q 1300 72.4 1241 70 Z" />
        <path d="M1368 4.9 Q 1435 2.5 1502 5 L 1503 69 Q 1435 73.2 1369 70 Z" />
        <path d="M1510 3.4 Q 1565 0.0 1620 5 L 1621 69 Q 1565 71.2 1511 70 Z" />
        <path d="M1628 4.0 Q 1697 1.0 1766 5 L 1767 69 Q 1697 72.0 1629 70 Z" />
        <path d="M-53 78.9 Q 23 76.5 99 79 L 100 139 Q 23 143.2 -52 140 Z" />
        <path d="M107 77.4 Q 165 74.0 223 79 L 224 139 Q 165 141.2 108 140 Z" />
        <path d="M231 78.0 Q 302 75.0 373 79 L 374 139 Q 302 142.0 232 140 Z" />
        <path d="M381 78.6 Q 446 76.0 511 79 L 512 139 Q 446 142.8 382 140 Z" />
        <path d="M519 77.1 Q 571 73.5 623 79 L 624 139 Q 571 140.8 520 140 Z" />
        <path d="M631 77.7 Q 705 74.5 779 79 L 780 139 Q 705 141.6 632 140 Z" />
        <path d="M787 78.3 Q 847 75.5 907 79 L 908 139 Q 847 142.4 788 140 Z" />
        <path d="M915 78.9 Q 982 76.5 1049 79 L 1050 139 Q 982 143.2 916 140 Z" />
        <path d="M1057 77.4 Q 1112 74.0 1167 79 L 1168 139 Q 1112 141.2 1058 140 Z" />
        <path d="M1175 78.0 Q 1244 75.0 1313 79 L 1314 139 Q 1244 142.0 1176 140 Z" />
        <path d="M1321 78.6 Q 1383 76.0 1445 79 L 1446 139 Q 1383 142.8 1322 140 Z" />
        <path d="M1453 77.1 Q 1529 73.5 1605 79 L 1606 139 Q 1529 140.8 1454 140 Z" />
        <path d="M1613 77.7 Q 1671 74.5 1729 79 L 1730 139 Q 1671 141.6 1614 140 Z" />
        <path d="M-110 148.6 Q -45 146.0 20 149 L 21 217 Q -45 220.8 -109 218 Z" />
        <path d="M28 147.1 Q 80 143.5 132 149 L 133 217 Q 80 218.8 29 218 Z" />
        <path d="M140 147.7 Q 214 144.5 288 149 L 289 217 Q 214 219.6 141 218 Z" />
        <path d="M296 148.3 Q 356 145.5 416 149 L 417 217 Q 356 220.4 297 218 Z" />
        <path d="M424 148.9 Q 491 146.5 558 149 L 559 217 Q 491 221.2 425 218 Z" />
        <path d="M566 147.4 Q 621 144.0 676 149 L 677 217 Q 621 219.2 567 218 Z" />
        <path d="M684 148.0 Q 753 145.0 822 149 L 823 217 Q 753 220.0 685 218 Z" />
        <path d="M830 148.6 Q 892 146.0 954 149 L 955 217 Q 892 220.8 831 218 Z" />
        <path d="M962 147.1 Q 1038 143.5 1114 149 L 1115 217 Q 1038 218.8 963 218 Z" />
        <path d="M1122 147.7 Q 1180 144.5 1238 149 L 1239 217 Q 1180 219.6 1123 218 Z" />
        <path d="M1246 148.3 Q 1317 145.5 1388 149 L 1389 217 Q 1317 220.4 1247 218 Z" />
        <path d="M1396 148.9 Q 1461 146.5 1526 149 L 1527 217 Q 1461 221.2 1397 218 Z" />
        <path d="M1534 147.4 Q 1586 144.0 1638 149 L 1639 217 Q 1586 219.2 1535 218 Z" />
        <path d="M-47 226.3 Q 13 223.5 73 227 L 74 289 Q 13 292.4 -46 290 Z" />
        <path d="M81 226.9 Q 148 224.5 215 227 L 216 289 Q 148 293.2 82 290 Z" />
        <path d="M223 225.4 Q 278 222.0 333 227 L 334 289 Q 278 291.2 224 290 Z" />
        <path d="M341 226.0 Q 410 223.0 479 227 L 480 289 Q 410 292.0 342 290 Z" />
        <path d="M487 226.6 Q 549 224.0 611 227 L 612 289 Q 549 292.8 488 290 Z" />
        <path d="M619 225.1 Q 695 221.5 771 227 L 772 289 Q 695 290.8 620 290 Z" />
        <path d="M779 225.7 Q 837 222.5 895 227 L 896 289 Q 837 291.6 780 290 Z" />
        <path d="M903 226.3 Q 974 223.5 1045 227 L 1046 289 Q 974 292.4 904 290 Z" />
        <path d="M1053 226.9 Q 1118 224.5 1183 227 L 1184 289 Q 1118 293.2 1054 290 Z" />
        <path d="M1191 225.4 Q 1243 222.0 1295 227 L 1296 289 Q 1243 291.2 1192 290 Z" />
        <path d="M1303 226.0 Q 1377 223.0 1451 227 L 1452 289 Q 1377 292.0 1304 290 Z" />
        <path d="M1459 226.6 Q 1519 224.0 1579 227 L 1580 289 Q 1519 292.8 1460 290 Z" />
        <path d="M1587 225.1 Q 1654 221.5 1721 227 L 1722 289 Q 1654 290.8 1588 290 Z" />
        <path d="M-104 298.0 Q -35 295.0 34 299 L 35 365 Q -35 368.0 -103 366 Z" />
        <path d="M42 298.6 Q 104 296.0 166 299 L 167 365 Q 104 368.8 43 366 Z" />
        <path d="M174 297.1 Q 250 293.5 326 299 L 327 365 Q 250 366.8 175 366 Z" />
        <path d="M334 297.7 Q 392 294.5 450 299 L 451 365 Q 392 367.6 335 366 Z" />
        <path d="M458 298.3 Q 529 295.5 600 299 L 601 365 Q 529 368.4 459 366 Z" />
        <path d="M608 298.9 Q 673 296.5 738 299 L 739 365 Q 673 369.2 609 366 Z" />
        <path d="M746 297.4 Q 798 294.0 850 299 L 851 365 Q 798 367.2 747 366 Z" />
        <path d="M858 298.0 Q 932 295.0 1006 299 L 1007 365 Q 932 368.0 859 366 Z" />
        <path d="M1014 298.6 Q 1074 296.0 1134 299 L 1135 365 Q 1074 368.8 1015 366 Z" />
        <path d="M1142 297.1 Q 1209 293.5 1276 299 L 1277 365 Q 1209 366.8 1143 366 Z" />
        <path d="M1284 297.7 Q 1339 294.5 1394 299 L 1395 365 Q 1339 367.6 1285 366 Z" />
        <path d="M1402 298.3 Q 1471 295.5 1540 299 L 1541 365 Q 1471 368.4 1403 366 Z" />
        <path d="M1548 298.9 Q 1610 296.5 1672 299 L 1673 365 Q 1610 369.2 1549 366 Z" />
        <path d="M-41 373.7 Q 17 370.5 75 375 L 76 435 Q 17 437.6 -40 436 Z" />
        <path d="M83 374.3 Q 154 371.5 225 375 L 226 435 Q 154 438.4 84 436 Z" />
        <path d="M233 374.9 Q 298 372.5 363 375 L 364 435 Q 298 439.2 234 436 Z" />
        <path d="M371 373.4 Q 423 370.0 475 375 L 476 435 Q 423 437.2 372 436 Z" />
        <path d="M483 374.0 Q 557 371.0 631 375 L 632 435 Q 557 438.0 484 436 Z" />
        <path d="M639 374.6 Q 699 372.0 759 375 L 760 435 Q 699 438.8 640 436 Z" />
        <path d="M767 373.1 Q 834 369.5 901 375 L 902 435 Q 834 436.8 768 436 Z" />
        <path d="M909 373.7 Q 964 370.5 1019 375 L 1020 435 Q 964 437.6 910 436 Z" />
        <path d="M1027 374.3 Q 1096 371.5 1165 375 L 1166 435 Q 1096 438.4 1028 436 Z" />
        <path d="M1173 374.9 Q 1235 372.5 1297 375 L 1298 435 Q 1235 439.2 1174 436 Z" />
        <path d="M1305 373.4 Q 1381 370.0 1457 375 L 1458 435 Q 1381 437.2 1306 436 Z" />
        <path d="M1465 374.0 Q 1523 371.0 1581 375 L 1582 435 Q 1523 438.0 1466 436 Z" />
        <path d="M1589 374.6 Q 1660 372.0 1731 375 L 1732 435 Q 1660 438.8 1590 436 Z" />
      </g>
      <g fill="#000" opacity="0.18">
        <path d="M240 120 q 30 40 10 90 q -20 30 4 60" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M1300 60 q -20 50 6 80" stroke="#000" strokeWidth="2" fill="none" />
      </g>
      <g fill="#3a5a3a" opacity="0.35">
        <ellipse cx="90" cy="430" rx="60" ry="14" />
        <ellipse cx="1180" cy="440" rx="80" ry="12" />
        <ellipse cx="660" cy="448" rx="50" ry="8" />
      </g>

      {/* Arches profondes avec claveaux */}
      <g>
        <path d="M470 460 L 470 240 C 470 170, 650 170, 650 240 L 650 460 Z" fill="url(#d-deep)" />
        <path
          d="M470 460 L 470 240 C 470 170, 650 170, 650 240 L 650 460"
          fill="none"
          stroke="url(#d-pillar)"
          strokeWidth="26"
        />
        <path
          d="M470 240 C 470 170, 650 170, 650 240"
          fill="none"
          stroke="#07050a"
          strokeWidth="30"
          strokeDasharray="3 24"
          opacity="0.9"
        />
        <path
          d="M1070 460 L 1070 240 C 1070 170, 1250 170, 1250 240 L 1250 460 Z"
          fill="url(#d-deep)"
        />
        <path
          d="M1070 460 L 1070 240 C 1070 170, 1250 170, 1250 240 L 1250 460"
          fill="none"
          stroke="url(#d-pillar)"
          strokeWidth="26"
        />
        <path
          d="M1070 240 C 1070 170, 1250 170, 1250 240"
          fill="none"
          stroke="#07050a"
          strokeWidth="30"
          strokeDasharray="3 24"
          opacity="0.9"
        />
        <g fill="#ff3b3b" opacity="0.8">
          <circle className="flicker" cx="548" cy="350" r="3" />
          <circle className="flicker" cx="564" cy="350" r="3" />
          <circle
            className="flicker"
            cx="1168"
            cy="372"
            r="2.5"
            style={{ animationDelay: '0.6s' }}
          />
          <circle
            className="flicker"
            cx="1182"
            cy="372"
            r="2.5"
            style={{ animationDelay: '0.6s' }}
          />
        </g>
      </g>

      {/* Piliers */}
      <g>
        <path
          d="M0 0 L 70 0 L 70 460 L 0 460 Z M1560 0 L 1640 0 L 1640 460 L 1560 460 Z"
          fill="url(#d-pillar)"
        />
        <path
          d="M0 40 H 76 M0 420 H 80 M1554 40 H 1640 M1550 420 H 1640"
          stroke="#4a3f5a"
          strokeWidth="10"
        />
      </g>

      {/* Bannières plissées */}
      <g stroke="#07050a" strokeWidth="2.5">
        <path
          d="M296 36 L 384 36 L 386 214 L 362 198 L 340 222 L 318 198 L 294 214 Z"
          fill="url(#d-banner)"
        />
        <path
          d="M856 36 L 944 36 L 946 214 L 922 198 L 900 222 L 878 198 L 854 214 Z"
          fill="url(#d-banner)"
        />
        <path
          d="M286 34 H 394 M846 34 H 954"
          stroke="url(#d-iron)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
      <g fill="#d4a64a" stroke="#6a4a12" strokeWidth="1.5">
        <path d="M340 128 c -16 0 -22 -16 -12 -24 c 6 -4 12 -2 12 4 c 0 -6 6 -8 12 -4 c 10 8 4 24 -12 24 z" />
        <circle cx="322" cy="92" r="6" />
        <circle cx="358" cy="92" r="6" />
        <circle cx="334" cy="82" r="5" />
        <circle cx="348" cy="82" r="5" />
        <path d="M900 128 c -16 0 -22 -16 -12 -24 c 6 -4 12 -2 12 4 c 0 -6 6 -8 12 -4 c 10 8 4 24 -12 24 z" />
        <circle cx="882" cy="92" r="6" />
        <circle cx="918" cy="92" r="6" />
        <circle cx="894" cy="82" r="5" />
        <circle cx="908" cy="82" r="5" />
      </g>

      {/* Chaînes */}
      <g fill="none" stroke="#4a4256" strokeWidth="4">
        <path d="M716 0 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14" />
        <path d="M770 0 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14 m 0 8 v 14" />
        <g strokeWidth="3">
          <ellipse cx="716" cy="18" rx="5" ry="7" />
          <ellipse cx="716" cy="62" rx="5" ry="7" />
          <ellipse cx="716" cy="106" rx="5" ry="7" />
          <ellipse cx="716" cy="150" rx="5" ry="7" />
          <ellipse cx="716" cy="194" rx="5" ry="7" />
          <ellipse cx="770" cy="18" rx="5" ry="7" />
          <ellipse cx="770" cy="62" rx="5" ry="7" />
          <ellipse cx="770" cy="106" rx="5" ry="7" />
          <ellipse cx="770" cy="150" rx="5" ry="7" />
        </g>
        <path
          d="M704 230 q 12 -12 24 0 l -4 10 h -16 z"
          fill="#2a2430"
          stroke="#07050a"
          strokeWidth="2"
        />
      </g>

      {/* Torches en fer forgé */}
      <g>
        <circle className="flicker" cx="180" cy="190" r="190" fill="url(#d-torch)" />
        <circle
          className="flicker"
          cx="760"
          cy="190"
          r="170"
          fill="url(#d-torch)"
          style={{ animationDelay: '0.4s' }}
        />
        <circle
          className="flicker"
          cx="1400"
          cy="190"
          r="190"
          fill="url(#d-torch)"
          style={{ animationDelay: '0.8s' }}
        />
        <g fill="url(#d-iron)" stroke="#07050a" strokeWidth="2">
          <path d="M166 214 L 194 214 L 188 236 L 172 236 Z M174 236 L 186 236 L 184 270 L 176 270 Z M168 260 H 192 V 268 H 168 Z" />
          <path d="M746 214 L 774 214 L 768 236 L 752 236 Z M754 236 L 766 236 L 764 270 L 756 270 Z M748 260 H 772 V 268 H 748 Z" />
          <path d="M1386 214 L 1414 214 L 1408 236 L 1392 236 Z M1394 236 L 1406 236 L 1404 270 L 1396 270 Z M1388 260 H 1412 V 268 H 1388 Z" />
        </g>
        <g className="flicker" fill="url(#d-flame)">
          <path d="M180 214 C 162 204, 164 184, 174 172 C 172 184, 180 186, 180 176 C 182 164, 190 158, 188 146 C 200 164, 204 196, 180 214 Z" />
          <path d="M760 214 C 742 204, 744 184, 754 172 C 752 184, 760 186, 760 176 C 762 164, 770 158, 768 146 C 780 164, 784 196, 760 214 Z" />
          <path d="M1400 214 C 1382 204, 1384 184, 1394 172 C 1392 184, 1400 186, 1400 176 C 1402 164, 1410 158, 1408 146 C 1420 164, 1424 196, 1400 214 Z" />
        </g>
      </g>

      {/* Sol dallé en perspective */}
      <path d="M0 460 L 1640 460 L 1640 720 L 0 720 Z" fill="url(#d-floor)" />
      <path
        d="M-440 460 L -2000 720 M-351 460 L -1800 720 M-261 460 L -1600 720 M-172 460 L -1400 720 M-83 460 L -1200 720 M7 460 L -1000 720 M96 460 L -800 720 M186 460 L -600 720 M275 460 L -400 720 M364 460 L -200 720 M454 460 L 0 720 M543 460 L 200 720 M632 460 L 400 720 M722 460 L 600 720 M811 460 L 800 720 M900 460 L 1000 720 M990 460 L 1200 720 M1079 460 L 1400 720 M1169 460 L 1600 720 M1258 460 L 1800 720 M1347 460 L 2000 720 M1437 460 L 2200 720 M1526 460 L 2400 720 M1615 460 L 2600 720 M1705 460 L 2800 720 M1794 460 L 3000 720 M1883 460 L 3200 720 M1973 460 L 3400 720 M2062 460 L 3600 720 M0 492 H1640 M0 532 H1640 M0 584 H1640 M0 650 H1640"
        fill="none"
        stroke="#07050a"
        strokeWidth="3"
        opacity="0.75"
      />
      <path
        d="M-440 460 L -2000 720 M-351 460 L -1800 720 M-261 460 L -1600 720 M-172 460 L -1400 720 M-83 460 L -1200 720 M7 460 L -1000 720 M96 460 L -800 720 M186 460 L -600 720 M275 460 L -400 720 M364 460 L -200 720 M454 460 L 0 720 M543 460 L 200 720 M632 460 L 400 720 M722 460 L 600 720 M811 460 L 800 720 M900 460 L 1000 720 M990 460 L 1200 720 M1079 460 L 1400 720 M1169 460 L 1600 720 M1258 460 L 1800 720 M1347 460 L 2000 720 M1437 460 L 2200 720 M1526 460 L 2400 720 M1615 460 L 2600 720 M1705 460 L 2800 720 M1794 460 L 3000 720 M1883 460 L 3200 720 M1973 460 L 3400 720 M2062 460 L 3600 720 M0 492 H1640 M0 532 H1640 M0 584 H1640 M0 650 H1640"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.05"
        transform="translate(2 2)"
      />
      <path d="M0 460 H1640" stroke="#07050a" strokeWidth="8" />
      <g>
        <ellipse cx="200" cy="520" rx="260" ry="60" fill="url(#d-pool)" />
        <ellipse cx="760" cy="510" rx="220" ry="50" fill="url(#d-pool)" />
        <ellipse cx="1400" cy="520" rx="260" ry="60" fill="url(#d-pool)" />
        <ellipse cx="1080" cy="640" rx="120" ry="16" fill="#1a1428" opacity="0.8" />
        <ellipse cx="1080" cy="636" rx="90" ry="8" fill="#ff9a3d" opacity="0.12" />
      </g>
      <ellipse className="aura" cx="850" cy="600" rx="200" ry="40" fill="url(#d-arcane)" />
      <g stroke="#9b6bff" strokeWidth="2" fill="none" opacity="0.45" className="aura">
        <ellipse cx="850" cy="600" rx="150" ry="28" />
        <path d="M730 600 L 970 600 M850 576 L 850 624 M766 586 L 934 614 M766 614 L 934 586" />
      </g>

      {/* Os, crâne et toiles */}
      <g stroke="#3a3226" strokeWidth="1.5">
        <path
          d="M1290 664 c 0 -22 34 -22 34 0 c 0 8 -4 12 -8 14 v 6 h -18 v -6 c -4 -2 -8 -6 -8 -14 z"
          fill="url(#d-bone)"
        />
        <circle cx="1300" cy="664" r="4.5" fill="#1a1414" />
        <circle cx="1314" cy="664" r="4.5" fill="#1a1414" />
        <path
          d="M1240 690 L 1280 676"
          stroke="url(#d-bone)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M260 690 L 316 684 M120 650 L 150 664"
          stroke="#c9bc9a"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <g fill="none" stroke="#c9c2d6" strokeWidth="1" opacity="0.35">
        <path d="M70 0 Q 110 40 70 90 M70 0 Q 130 20 150 0 M70 0 L 140 70 M84 14 Q 100 10 112 0 M96 30 Q 120 30 132 14 M90 52 Q 116 56 140 38" />
        <path d="M1560 0 Q 1520 40 1560 90 M1560 0 Q 1500 20 1480 0 M1560 0 L 1490 70 M1546 14 Q 1530 10 1518 0 M1534 30 Q 1510 30 1498 14" />
      </g>

      {/* Gouttes et poussières */}
      <g fill="#8ab0d0">
        <ellipse className="drip" cx="404" cy="120" rx="2" ry="4" />
        <ellipse
          className="drip"
          cx="1006"
          cy="96"
          rx="2"
          ry="4"
          style={{ animationDelay: '2.2s' }}
        />
        <ellipse
          className="drip"
          cx="1330"
          cy="150"
          rx="2"
          ry="4"
          style={{ animationDelay: '3.7s' }}
        />
      </g>
      <g fill="#ffd8a0">
        <circle className="mote" cx="170" cy="260" r="1.6" />
        <circle className="mote" cx="200" cy="300" r="1.2" style={{ animationDelay: '2s' }} />
        <circle className="mote" cx="750" cy="270" r="1.5" style={{ animationDelay: '1s' }} />
        <circle className="mote" cx="780" cy="300" r="1.2" style={{ animationDelay: '3.4s' }} />
        <circle className="mote" cx="1390" cy="270" r="1.6" style={{ animationDelay: '4s' }} />
      </g>

      {/* Brume basse, braises, grain et vignette */}
      <g fill="#8a7aa8" opacity="0.14" filter="url(#d-blur)">
        <ellipse cx="400" cy="680" rx="420" ry="28" />
        <ellipse cx="1200" cy="690" rx="460" ry="30" />
      </g>
      <g fill="#ff9a4d">
        <circle className="ember" cx="180" cy="230" r="2.5" style={{ animationDelay: '0s' }} />
        <circle className="ember" cx="760" cy="230" r="2" style={{ animationDelay: '1.5s' }} />
        <circle className="ember" cx="1400" cy="230" r="2.5" style={{ animationDelay: '0.7s' }} />
        <circle className="ember" cx="400" cy="700" r="2" style={{ animationDelay: '2.2s' }} />
        <circle className="ember" cx="980" cy="700" r="2" style={{ animationDelay: '3.4s' }} />
      </g>
      <rect width="1640" height="720" filter="url(#d-grain)" opacity="0.2" />
      <rect width="1640" height="720" fill="url(#d-vignette)" />
    </svg>
  )
}
