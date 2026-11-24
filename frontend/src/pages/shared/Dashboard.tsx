import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { ROLES } from '../../utils/roles'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

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
    {
      to: '/magistrate/officers',
      title: 'Officer Directory',
      desc: 'View all officers — current and previous postings, tenure, and the cases each has registered with their status.',
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

export function Dashboard() {
  const { roles } = useAuth()

  const sections = roles.includes(ROLES.ADMIN)      ? adminSections()
                 : roles.includes(ROLES.OFFICER)    ? officerSections()
                 : roles.includes(ROLES.MAGISTRATE) ? magistrateSections()
                 : citizenSections()

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

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
