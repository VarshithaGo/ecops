import keycloak from '../auth/keycloak'

const C = {
  angst:    '#0A0A0A',
  kite:     '#371E1E',
  bark:     '#33312F',
  charcoal: '#726E68',
  ashes:    '#B7B4AE',
}

function Star({ x, y, size = 16 }: { x: number; y: number; size?: number }) {
  const h = size / 2
  const q = size / 4
  return (
    <polygon
      points={`${x},${y - h} ${x + q * 0.4},${y - q * 0.4} ${x + h},${y} ${x + q * 0.4},${y + q * 0.4} ${x},${y + h} ${x - q * 0.4},${y + q * 0.4} ${x - h},${y} ${x - q * 0.4},${y - q * 0.4}`}
      fill={C.ashes}
    />
  )
}

function GlobeLogo() {
  const R = 88
  // latitude lines: y positions on the globe, ry is foreshortened
  const latLines = [-66, -44, -22, 0, 22, 44, 66].map((y) => ({
    y,
    rx: Math.sqrt(R * R - y * y),
    ry: Math.sqrt(R * R - y * y) * 0.28,
  }))
  // longitude lines: full ellipses through center at different rotations
  const lonAngles = [0, 30, 60, 90, 120, 150]

  return (
    <svg viewBox="-130 -128 260 256" width="220" height="220" style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <clipPath id="globeClip">
          <circle cx="0" cy="0" r={R} />
        </clipPath>
        {/* clip the back half of the orbit ring */}
        <clipPath id="orbitFront">
          <rect x="-200" y="0" width="400" height="200" />
        </clipPath>
        <clipPath id="orbitBack">
          <rect x="-200" y="-200" width="400" height="200" />
        </clipPath>
      </defs>

      {/* Globe fill */}
      <circle cx="0" cy="0" r={R} fill={C.angst} />

      {/* Grid lines inside globe */}
      <g clipPath="url(#globeClip)" stroke={C.ashes} strokeWidth="0.8" fill="none" opacity="0.45">
        {/* latitude */}
        {latLines.map(({ y, rx, ry }) => (
          <ellipse key={y} cx="0" cy={y} rx={rx} ry={ry} />
        ))}
        {/* longitude */}
        {lonAngles.map((deg) => (
          <ellipse key={deg} cx="0" cy="0" rx={R * 0.28} ry={R} transform={`rotate(${deg})`} />
        ))}
      </g>

      {/* Globe border */}
      <circle cx="0" cy="0" r={R} fill="none" stroke={C.ashes} strokeWidth="1.5" />

      {/* Orbit ring — back half (behind globe) */}
      <ellipse cx="4" cy="10" rx="118" ry="28" fill="none"
        stroke={C.charcoal} strokeWidth="3"
        transform="rotate(-18)"
        clipPath="url(#orbitBack)"
        strokeDasharray="4 2"
      />

      {/* "e-Cops" bold text — main */}
      <text
        x="0" y="18"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="58"
        fill={C.ashes}
        stroke={C.angst}
        strokeWidth="6"
        paintOrder="stroke"
        letterSpacing="-1"
      >
        e-Cops
      </text>

      {/* Orbit ring — front half (in front of text) */}
      <ellipse cx="4" cy="10" rx="118" ry="28" fill="none"
        stroke={C.ashes} strokeWidth="3"
        transform="rotate(-18)"
        clipPath="url(#orbitFront)"
      />
      {/* orbit end cap dot */}
      <circle cx="112" cy="30" r="5" fill={C.ashes} transform="rotate(-18, 4, 10)" />

      {/* Stars */}
      <Star x={-118} y={40} size={18} />
      <Star x={106} y={-66} size={12} />
      <Star x={-90} y={-82} size={9} />
      <Star x={118} y={68} size={8} />
    </svg>
  )
}

export function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/crime-tape.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${C.angst}ed 0%, ${C.kite}d0 50%, ${C.angst}ed 100%)`,
      }} />

      {/* card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: `${C.kite}bb`,
        border: `2px solid ${C.charcoal}`,
        borderRadius: 4,
        padding: '40px 52px 44px',
        minWidth: 380,
        maxWidth: 440,
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 0 0 1px ${C.bark}, 0 32px 80px ${C.angst}`,
      }}>

        {/* Globe logo */}
        <GlobeLogo />

        {/* Title */}
        <div style={{
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 13,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: C.charcoal,
          marginTop: 4,
          marginBottom: 4,
        }}>
          Bengaluru City Police
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.charcoal,
          opacity: 0.75,
          marginBottom: 32,
        }}>
          Virtual Police Station
        </div>

        {/* divider */}
        <div style={{ borderTop: `1px solid ${C.charcoal}44`, marginBottom: 28 }} />

        <button
          onClick={() => keycloak.login()}
          style={{
            width: '100%',
            padding: '14px 0',
            background: 'transparent',
            border: `1.5px solid ${C.charcoal}`,
            borderRadius: 3,
            color: C.ashes,
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 15,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            marginBottom: 14,
          }}
          onMouseEnter={(e) => {
            const b = e.target as HTMLButtonElement
            b.style.background = C.charcoal
            b.style.color = C.angst
          }}
          onMouseLeave={(e) => {
            const b = e.target as HTMLButtonElement
            b.style.background = 'transparent'
            b.style.color = C.ashes
          }}
        >
          Sign In
        </button>

        <div style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 10,
          color: C.charcoal,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          BNSS 2023 · Authorised Personnel Only
        </div>
      </div>

      {/* bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTop: `1px solid ${C.bark}`,
        background: `${C.angst}cc`,
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 11, color: C.charcoal, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Government of Karnataka
        </span>
        <span style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 11, color: C.bark, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Restricted Access
        </span>
      </div>
    </div>
  )
}
