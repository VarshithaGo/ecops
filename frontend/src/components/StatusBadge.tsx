const COLORS: Record<string, string> = {
  // FIR statuses
  REGISTERED: '#2563eb',
  UNDER_INVESTIGATION: '#d97706',
  CHARGE_SHEET_FILED: '#16a34a',
  FINAL_REPORT_FILED: '#7c3aed',
  // Complaint statuses
  FILED: '#2563eb',
  CATEGORIZED: '#d97706',
  CONVERTED_TO_FIR: '#16a34a',
  LOGGED_IN_NCR: '#7c3aed',
  REJECTED: '#dc2626',
  // Warrant statuses (BNSS)
  PENDING: '#d97706',
  ISSUED: '#16a34a',
  DENIED: '#dc2626',
  EXECUTED: '#7c3aed',
  CANCELLED: '#6b7280',
  // Legacy warrant statuses (kept for old data)
  GRANTED: '#16a34a',
  // Property statuses
  IN_CUSTODY: '#2563eb',
  RETURNED: '#16a34a',
  COURT_PRODUCED: '#7c3aed',
  DISPOSED: '#6b7280',
  // IO assignment
  ACTIVE: '#16a34a',
  TRANSFERRED: '#d97706',
  COMPLETED: '#6b7280',
  // NCR statuses
  OPEN: '#2563eb',
  REFERRED_TO_MAGISTRATE: '#7c3aed',
  MAGISTRATE_ORDERED: '#d97706',
  ESCALATED_TO_FIR: '#dc2626',
  SUPERSEDED: '#6b7280',
  // Criminal record roles/statuses
  NOT_ARRESTED: '#dc2626',
  ARRESTED: '#d97706',
  BAILED: '#0891b2',
  CONVICTED: '#16a34a',
  RELEASED: '#6b7280',
  WITNESS: '#2563eb',
  // Generic
  CLOSED: '#6b7280',
  INACTIVE: '#6b7280',
  SUBMITTED: '#2563eb',
  ACCEPTED: '#16a34a',
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = COLORS[status] ?? '#6b7280'
  const padding = size === 'sm' ? '2px 6px' : '3px 10px'
  const fontSize = size === 'sm' ? 11 : 12
  return (
    <span style={{
      display: 'inline-block',
      padding,
      fontSize,
      fontWeight: 600,
      borderRadius: 4,
      background: color + '18',
      color,
      letterSpacing: '0.02em',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
