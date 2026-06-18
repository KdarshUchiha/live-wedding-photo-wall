import { motion } from 'framer-motion'
import type { Wedding } from '../types'
import styles from './InvitePage.module.css'

interface Props { wedding: Wedding; onBack: () => void }

function LaceBorder() {
  return (
    <svg className={styles.lace} viewBox="0 0 400 30" fill="none">
      {Array.from({ length: 20 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 20}, 0)`}>
          <circle cx="10" cy="10" r="8" stroke="#c9a96e" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="10" cy="10" r="3" fill="#c9a96e" opacity="0.4" />
        </g>
      ))}
    </svg>
  )
}

function formatFullDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`
}

export default function InvitePage({ wedding, onBack }: Props) {
  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 240 }}
      >
        <LaceBorder />

        <div className={styles.inner}>
          <p className={styles.together}>Together with their families</p>
          <p className={styles.requestHonour}>request the honour of your presence</p>
          <p className={styles.atMarriage}>at the marriage of</p>

          <div className={styles.names}>
            <span className={styles.name}>{wedding.bride}</span>
            <span className={styles.ampersand}>&amp;</span>
            <span className={styles.name}>{wedding.groom}</span>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerFlower}>✿</span>
            <span className={styles.dividerLine} />
          </div>

          {wedding.date && (
            <p className={styles.date}>{formatFullDate(wedding.date)}</p>
          )}
          {wedding.time && (
            <p className={styles.time}>at {formatTime(wedding.time)}</p>
          )}

          {wedding.venue && (
            <>
              <p className={styles.venueLabel}>Ceremony &amp; Reception</p>
              <p className={styles.venueName}>{wedding.venue}</p>
            </>
          )}
          {wedding.location && (
            <p className={styles.venueLocation}>{wedding.location}</p>
          )}

          <div className={styles.divider} style={{ margin: '28px 0 24px' }}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerFlower}>✿</span>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.rsvpLabel}>Kindly reply by</p>
          <p className={styles.rsvpDate}>
            {wedding.date ? new Date(new Date(wedding.date).getTime() - 14 * 86400000)
              .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
          </p>

          <motion.button
            className={styles.rsvpBtn}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            RSVP
          </motion.button>
        </div>

        <LaceBorder />
      </motion.div>
    </div>
  )
}
