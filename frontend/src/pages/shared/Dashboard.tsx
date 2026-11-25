import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { ROLES } from '../../utils/roles'
import { useDashboardStats } from '../../hooks/useFIRData'
import { useCapabilities } from '../../hooks/useCapabilities'
import { Capability } from '../../utils/rank'
import { DashboardStats, DashboardActionItem } from '../../types/case.types'

import { C } from '../../theme'
import { A, FONT } from '../../theme'

function greetingName(roles: string[]) {
  if (roles.includes(ROLES.ADMIN))      return 'Admin'
  if (roles.includes(ROLES.OFFICER))    return 'Officer'
  if (roles.includes(ROLES.MAGISTRATE)) return 'Magistrate'
  return ''
}

function roleLabel(roles: string[]) {
  if (roles.includes(ROLES.ADMIN))      return 'Station Admin'
  if (roles.includes(ROLES.OFFICER))    return 'Police Officer'
  if (roles.includes(ROLES.MAGISTRATE)) return 'Magistrate'
  if (roles.includes(ROLES.CITIZEN))    return 'Citizen Portal'
  return 'User'
}

type Section = {
  to: string
  title: string
  desc: string
}

function officerSections(): Section[] {
  return [
    {
      to: '/officer/walk-in',
      title: 'Walk-in Complaint',
      desc: 'Register a complaint for a person who appears at the station in person. No citizen portal account required (BNSS Section 173).',
    },
    {
      to: '/officer/complaints',
      title: 'Complaints',
      desc: 'Review incoming complaints. Categorize each as a cognizable offence (FIR) or non-cognizable offence (NCR). Mark Zero FIR if the incident occurred outside this station\'s jurisdiction.',
    },
    {
      to: '/officer/firs',
      title: 'FIR Register',
      desc: 'Manage all cognizable cases. Assign an Investigating Officer, record Mahajar reports, seize property, add criminal records, file charge sheets and final reports, and request arrest warrants.',
    },
    {
      to: '/officer/ncr',
      title: 'NCR Register',
      desc: 'Track non-cognizable offences. Refer cases to the magistrate under BNSS Section 174 when required.',
    },
    {
      to: '/officer/criminals',
      title: 'Criminal Records',
      desc: 'Search the criminal database by name, area, district, or role — Suspect, Accused, Witness, or Convicted Person.',
    },
  ]
}

function adminSections(): Section[] {
  return [
    {
      to: '/admin/stations',
      title: 'Stations',
      desc: 'View, add, and manage police stations. Each station has a unique code, jurisdiction area, and contact details.',
    },
    {
      to: '/admin/assignments',
      title: 'Officer Assignments',
      desc: 'Assign officers to their respective stations. Manage staffing across all stations in the system.',
    },
    ...officerSections(),
  ]
}

function magistrateSections(): Section[] {
  return [
    {
      to: '/magistrate/ncr',
      title: 'NCR Referrals',
      desc: 'Non-cognizable offences referred to you by the duty officer under BNSS Section 174. Order investigation as required.',
    },
    {
      to: '/magistrate/warrants',
      title: 'Warrants',
      desc: 'Review arrest warrant requests submitted by investigating officers. Issue or reject each request under the appropriate BNSS provision.',
    },
  ]
}

function citizenSections(): Section[] {
  return [
    {
      to: '/citizen/file-complaint',
      title: 'File Complaint',
      desc: 'Submit a complaint online. Your complaint will be received and categorized by the duty officer at the concerned station.',
    },
    {
      to: '/citizen/track',
      title: 'Track Cases',
      desc: 'View the current status of all complaints and cases linked to your account.',
    },
  ]
}

function InstructionCard({ section }: { section: Section }) {
  return (
    <Link to={section.to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: `${C.kite}bb`,
        border: `2px solid ${C.charcoal}`,
        borderRadius: 4,
        padding: '20px 24px',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const d = e.currentTarget as HTMLDivElement
        d.style.borderColor = C.ashes
        d.style.background = `${C.kite}ee`
      }}
      onMouseLeave={(e) => {
        const d = e.currentTarget as HTMLDivElement
        d.style.borderColor = C.charcoal
        d.style.background = `${C.kite}bb`
      }}
      >
        <div style={{
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 16, letterSpacing: '0.08em',
          color: C.ashes, marginBottom: 8,
        }}>
          {section.title}
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 13, lineHeight: 1.6,
          color: C.charcoal,
        }}>
          {section.desc}
        </div>
      </div>
    </Link>
  )
}

type Tile = { label: string; value: number; to?: string; alert?: boolean }

function buildTiles(roles: string[], stats: DashboardStats): Tile[] {
  if (roles.includes(ROLES.MAGISTRATE) && !roles.includes(ROLES.OFFICER) && !roles.includes(ROLES.ADMIN)) {
    return [
      { label: 'Warrants Pending', value: stats.warrantsPending, to: '/magistrate/warrants', alert: stats.warrantsPending > 0 },
      { label: 'NCR Referrals Open', value: stats.ncrOpen, to: '/magistrate/ncr' },
      { label: 'FIRs Under Investigation', value: stats.firsUnderInvestigation },
    ]
  }
  // Officer / Admin
  return [
    { label: 'Complaints Pending', value: stats.complaintsPending, to: '/officer/complaints', alert: stats.complaintsPending > 0 },
    { label: 'FIRs Under Investigation', value: stats.firsUnderInvestigation, to: '/officer/firs' },
    { label: 'Warrants Pending', value: stats.warrantsPending },
    { label: 'NCRs Open', value: stats.ncrOpen, to: '/officer/ncr' },
    { label: 'Charge Sheets Filed', value: stats.chargeSheetsFiled },
  ]
}

function StatTile({ tile }: { tile: Tile }) {
  const accent = tile.alert ? '#B45309' : A.accent
  const body = (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.bark}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: 10,
      padding: '18px 20px',
      minWidth: 150, flex: 1,
      boxShadow: '0 1px 2px rgba(16,32,44,0.04), 0 1px 3px rgba(16,32,44,0.06)',
    }}>
      <div style={{ fontFamily: FONT.ui, fontSize: 36, fontWeight: 800, lineHeight: 1, color: accent }}>
        {tile.value}
      </div>
      <div style={{ fontFamily: FONT.ui, fontSize: 13, fontWeight: 500, color: C.charcoal, marginTop: 8 }}>
        {tile.label}
      </div>
    </div>
  )
  return tile.to ? <Link to={tile.to} style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>{body}</Link> : body
}

function ActionRequiredPanel({ items }: { items: DashboardActionItem[] }) {
  if (items.length === 0) return null
  return (
    <div style={{ border: '2px solid #fb923c66', background: '#fb923c10', borderRadius: 4, padding: '20px 24px', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 14, letterSpacing: '0.1em', color: '#fb923c' }}>
          ACTION REQUIRED
        </span>
        <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal }}>
          BNSS §193 — charge-sheet deadline (90 days)
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it) => {
          const color = it.state === 'OVERDUE' ? '#f87171' : '#fb923c'
          const text = it.state === 'OVERDUE'
            ? `${Math.abs(it.daysRemaining)} day(s) overdue`
            : `${it.daysRemaining} day(s) remaining`
          return (
            <Link key={it.firId} to={`/officer/firs/${it.firId}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '10px 14px', border: `1px solid ${C.bark}`, borderRadius: 3, background: `${C.kite}88`,
              }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: C.ashes }}>
                  {it.firNumber} <span style={{ color: C.charcoal, fontWeight: 400 }}>· {it.stationCode}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal }}>
                    Day {it.daysElapsed} of 90
                  </span>
                  <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.08em', color, border: `1px solid ${color}`, borderRadius: 3, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                    {text}
                  </span>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { roles, username } = useAuth()
  const { can } = useCapabilities()

  const baseSections = roles.includes(ROLES.ADMIN)      ? adminSections()
                 : roles.includes(ROLES.OFFICER)    ? officerSections()
                 : roles.includes(ROLES.MAGISTRATE) ? magistrateSections()
                 : citizenSections()
  // Hide officer quick-access cards the officer's rank can't use.
  const CAP_BY_PATH: Partial<Record<string, Capability>> = {
    '/officer/walk-in': 'WALKIN',
    '/officer/complaints': 'CATEGORIZE',
    '/officer/firs': 'INVESTIGATE',
    '/officer/ncr': 'CATEGORIZE',
    '/officer/criminals': 'INVESTIGATE',
  }
  const sections = baseSections.filter((s) => { const c = CAP_BY_PATH[s.to]; return !c || can(c) })
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isStaff = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.OFFICER) || roles.includes(ROLES.MAGISTRATE)
  const { data: stats } = useDashboardStats()

  return (
    <div style={{ padding: '36px 40px', maxWidth: 960, margin: '0 auto' }}>

      {/* Greeting */}
      <div style={{
        background: `${C.kite}99`,
        border: `2px solid ${C.bark}`,
        borderRadius: 4,
        padding: '28px 32px',
        marginBottom: 32,
        backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 32, letterSpacing: '0.04em',
            color: C.ashes, lineHeight: 1.1, marginBottom: 6,
          }}>
            Welcome, {greetingName(roles)}
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: C.charcoal,
          }}>
            {roleLabel(roles)} · Bengaluru City Police
          </div>
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 12, color: C.charcoal, letterSpacing: '0.06em', textAlign: 'right',
        }}>
          {dateStr}
        </div>
      </div>

      {/* Live metrics (staff only) */}
      {isStaff && stats && (
        <>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
            {buildTiles(roles, stats).map((t) => <StatTile key={t.label} tile={t} />)}
          </div>
          {(roles.includes(ROLES.OFFICER) || roles.includes(ROLES.ADMIN)) && (
            <ActionRequiredPanel items={stats.actionRequired} />
          )}
        </>
      )}

      {/* Section heading */}
      <div style={{
        fontFamily: 'Anton, Impact, sans-serif',
        fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: C.charcoal, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span>Quick Access</span>
        <div style={{ flex: 1, height: 1, background: C.bark }} />
      </div>

      {/* Instruction cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {sections.map((s) => <InstructionCard key={s.to} section={s} />)}
      </div>

    </div>
  )
}
