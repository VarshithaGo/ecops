const C = { charcoal: '#726E68', ashes: '#B7B4AE', bark: '#33312F' }

interface DetailRowProps {
  label: string
  value: React.ReactNode
  mono?: boolean
}

export function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
      <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, minWidth: 180, flexShrink: 0 }}>{label}:</span>
      <span style={{ fontFamily: mono ? 'monospace' : "'Space Grotesk', system-ui, sans-serif", color: C.ashes }}>{value ?? '—'}</span>
    </div>
  )
}
