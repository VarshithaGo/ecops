import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useCurrentOfficer } from '../hooks/useCurrentOfficer'
import { ROLES } from '../utils/roles'
import { A, FONT } from '../theme'

const LINKS: { to: string; label: string; roles: string[] }[] = [
  { to: '/admin/stations',     label: 'Stations',          roles: [ROLES.ADMIN] },
  { to: '/admin/assignments',  label: 'Assignments',        roles: [ROLES.ADMIN] },
  { to: '/officer/walk-in',    label: 'Walk-in',            roles: [ROLES.OFFICER] },
  { to: '/officer/complaints', label: 'Complaints',         roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/officer/firs',       label: 'FIR Register',       roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/officer/ncr',        label: 'NCR Register',       roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/officer/criminals',  label: 'Criminal Records',   roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/magistrate/warrants',label: 'Warrants',           roles: [ROLES.MAGISTRATE] },
  { to: '/magistrate/ncr',     label: 'NCR Referrals',      roles: [ROLES.MAGISTRATE] },
  { to: '/citizen/file-complaint', label: 'File Complaint', roles: [ROLES.CITIZEN] },
  { to: '/citizen/track',      label: 'Track Cases',        roles: [ROLES.CITIZEN] },
]

const onDark = 'rgba(255,255,255,0.78)'

export function NavBar() {
  const { roles, username, logout } = useAuth()
  const { officerName, stationName, stationCode } = useCurrentOfficer()
  const location = useLocation()
  const visible = LINKS.filter((l) => l.roles.some((r) => roles.includes(r)))

  const displayName = officerName || username

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: A.accent,
      display: 'flex', alignItems: 'center',
      padding: '0 20px', height: 56,
      boxShadow: '0 1px 4px rgba(16,32,44,0.18)',
      fontFamily: FONT.ui,
    }}>
      {/* Brand */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        color: '#fff', textDecoration: 'none',
        marginRight: 24, paddingRight: 22, whiteSpace: 'nowrap',
        borderRight: '1px solid rgba(255,255,255,0.22)',
      }}>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>e-Cops</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: onDark, letterSpacing: '0.02em' }}>
          Police Case Management
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', alignItems: 'center' }}>
        {visible.map((l) => {
          const active = location.pathname === l.to || location.pathname.startsWith(l.to + '/')
          return (
            <Link key={l.to} to={l.to} style={{
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? '#fff' : onDark,
              textDecoration: 'none',
              padding: '7px 12px',
              borderRadius: 6,
              background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
              whiteSpace: 'nowrap',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              {l.label}
            </Link>
          )
        })}
      </div>

      {/* User + station + logout */}
      {displayName && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25, marginLeft: 16, marginRight: 14, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{displayName}</span>
          {stationName && (
            <span style={{ fontSize: 11, color: onDark }}>
              {stationName}{stationCode ? ` (${stationCode})` : ''}
            </span>
          )}
        </div>
      )}
      <button onClick={logout} style={{
        fontSize: 13, fontWeight: 600,
        padding: '7px 14px',
        background: 'rgba(255,255,255,0.12)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 6, whiteSpace: 'nowrap',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
      >
        Log out
      </button>
    </nav>
  )
}
