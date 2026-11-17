import './Logo.css'

/**
 * Logo "Kamila Dentys" — SVG inline con motion graphic de entrada.
 *
 * variantes:
 *   - "mono": diente + K dorada (compacto, para el header).
 *   - "full": corona + laurel + wordmark (login/registro).
 *
 * Animación (una vez al montar):
 *   1. corona y K se dibujan a trazo (stroke-dash)
 *   2. ramas de laurel crecen hoja por hoja
 *   3. pasada de brillo dorado (shine)
 * Respeta prefers-reduced-motion (se muestra estático completo).
 */

// Delays de crecimiento de las hojas (tras el trazo de K + diente)
const LEAF_BASE = 0.95
const LEAF_STEP = 0.07

function Leaf({ x, y, angle = 0, index }) {
  return (
    <path
      className="logo-leaf"
      style={{ animationDelay: `${LEAF_BASE + index * LEAF_STEP}s` }}
      d="M0 0 Q5.5 -4.5 11 -0.4 Q5 4.2 0 0 Z"
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  )
}

/* Ramas de laurel: tallo + 6 hojas alternadas por lado. */
function LaurelBranch({ mirrored = false }) {
  return (
    <g
      className="logo-laurel"
      transform={mirrored ? 'translate(200 0) scale(-1 1)' : undefined}
      fill="url(#logoGold)"
    >
      <path
        className="logo-line logo-laurel-stem"
        style={{ animationDelay: '0.85s' }}
        d="M36 132 C 20 106, 17 70, 33 42"
        fill="none"
      />
      <Leaf x={33} y={38} angle={-75} index={0} />
      <Leaf x={25} y={56} angle={-55} index={1} />
      <Leaf x={22} y={76} angle={-40} index={2} />
      <Leaf x={24} y={96} angle={-25} index={3} />
      <Leaf x={30} y={116} angle={-8} index={4} />
      <Leaf x={14} y={66} angle={-160} index={5} />
      <Leaf x={14} y={88} angle={-145} index={6} />
    </g>
  )
}

function Crest({ shine = true }) {
  return (
    <g className="logo-crest">
      <LaurelBranch />
      <LaurelBranch mirrored />

      {/* K caligráfica: asta + dos brazos al estilo script */}
      <path
        className="logo-line logo-k"
        style={{ animationDelay: '0.2s' }}
        d="M 74 24 C 64 54, 60 96, 62 126"
        fill="none"
      />
      <path
        className="logo-line logo-k"
        style={{ animationDelay: '0.35s' }}
        d="M 58 72 C 78 58, 110 38, 142 24"
        fill="none"
      />
      <path
        className="logo-line logo-k"
        style={{ animationDelay: '0.5s' }}
        d="M 58 74 C 82 86, 114 106, 142 126"
        fill="none"
      />

      {/* Diente dorado en el corazón de la K (entre sus brazos) */}
      <path
        className="logo-line logo-tooth"
        style={{ animationDelay: '0.7s' }}
        d="M55 55C40 20 160 20 145 55c15 15 10 65 5 85-20 20-40 0-50 0s-30 20-50 0c-5-20-10-70 5-85z"
        fill="none"
        transform="translate(103 74) scale(0.3) translate(-100 -83)"
      />

      {shine && (
        <rect className="logo-shine" x="-30" y="20" width="34" height="140"
          transform="rotate(18 70 90)" fill="url(#logoShine)" />
      )}
    </g>
  )
}

export default function Logo({ variant = 'mono', className = '', title = 'Kamila Dentys — Laboratorio Dental' }) {
  const isFull = variant === 'full'
  return (
    <svg
      className={`logo logo--${variant} ${className}`}
      viewBox={isFull ? '0 0 760 170' : '0 0 200 150'}
      role="img"
      aria-label={title}
      data-testid={`logo-${variant}`}
    >
      <defs>
        {/* Dorado del logo original */}
        <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9C97C" />
          <stop offset="45%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#9E7B36" />
        </linearGradient>
        <linearGradient id="logoShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="logoNavy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#24395F" />
          <stop offset="100%" stopColor="#13203F" />
        </linearGradient>
      </defs>

      <Crest shine={isFull} />

      {isFull && (
        <g className="logo-wordmark">
          <line className="logo-divider" x1="252" y1="46" x2="252" y2="128"
            stroke="#2A3F63" strokeWidth="3" strokeLinecap="round" />
          <text x="278" y="96" className="logo-text-main" fill="url(#logoNavy)">
            KAMILA
            <tspan dx="14" fill="url(#logoGold)">DENTYS</tspan>
          </text>
          <text x="280" y="126" className="logo-text-sub" fill="#5A6B85">
            LABORATORIO DENTAL
          </text>
        </g>
      )}
    </svg>
  )
}
