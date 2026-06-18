import type { Wedding } from '../types'
import styles from './EnvelopeCard.module.css'

interface Props {
  wedding: Wedding
  size: 'large' | 'small'
  onClick: () => void
}

function WaxSeal({ color: _color }: { color: string }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="24" fill="white" opacity="0.22" />
      <circle cx="26" cy="26" r="20" fill="white" opacity="0.3" />
      {/* petal pattern */}
      {[0,60,120,180,240,300].map((deg) => (
        <ellipse key={deg} cx="26" cy="14" rx="3.5" ry="7"
          fill="white" opacity="0.5"
          transform={`rotate(${deg} 26 26)`} />
      ))}
      <circle cx="26" cy="26" r="8" fill="white" opacity="0.4" />
    </svg>
  )
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount))
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount))
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount))
  return `rgb(${r},${g},${b})`
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
}

export default function EnvelopeCard({ wedding, size, onClick }: Props) {
  const bg = wedding.themeColor || '#8B1A1A'
  const isLarge = size === 'large'

  return (
    <button
      className={`${styles.card} ${isLarge ? styles.large : styles.small}`}
      style={{ '--card-bg': bg, '--card-bg-light': lighten(bg, 0.12) } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Envelope flap */}
      <div className={styles.flap} />

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.names}>
          {wedding.bride}<br />
          <span className={styles.and}>and</span><br />
          {wedding.groom}
        </p>

        <div className={styles.seal}>
          <WaxSeal color={bg} />
        </div>

        <p className={styles.date}>{formatDate(wedding.date)}</p>
        {wedding.location && (
          <p className={styles.location}>📍 {wedding.location}</p>
        )}
      </div>

      {/* Envelope bottom fold lines */}
      <div className={styles.bottomLeft} />
      <div className={styles.bottomRight} />
    </button>
  )
}
