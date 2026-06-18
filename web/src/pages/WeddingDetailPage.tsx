import { motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { usePhotos } from '../hooks/usePhotos'
import type { Wedding } from '../types'
import styles from './WeddingDetailPage.module.css'

interface Props {
  wedding: Wedding
  user: User
  onBack: () => void
  onPhotos: () => void
  onVideos: () => void
  onInvite: () => void
}

function Sparkle({ x, y, size = 16, opacity = 0.7 }: { x: string; y: string; size?: number; opacity?: number }) {
  return (
    <span className={styles.sparkle} style={{ left: x, top: y, fontSize: size, opacity }}>✦</span>
  )
}

function PearlString() {
  return (
    <svg className={styles.pearls} viewBox="0 0 200 80" fill="none">
      {Array.from({ length: 18 }).map((_, i) => {
        const t = i / 17
        const x = t * 180 + 10
        const y = 40 + Math.sin(t * Math.PI) * -28
        return <circle key={i} cx={x} cy={y} r="5" fill="white" opacity="0.85" />
      })}
    </svg>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return { day: '', month: '', year: '' }
  const d = new Date(dateStr + 'T12:00:00')
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase(),
    year: d.getFullYear().toString(),
  }
}

export default function WeddingDetailPage({ wedding, onBack, onPhotos, onVideos, onInvite }: Props) {
  const photos = usePhotos(wedding.id)
  const { day, month, year } = formatDate(wedding.date)
  const previewPhotos = photos.slice(0, 5)

  return (
    <div className={styles.page}>
      {/* Back button */}
      <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Pearl decoration */}
      <div className={styles.pearlsWrap}><PearlString /></div>

      {/* Sparkles */}
      <Sparkle x="75%" y="8%" size={20} opacity={0.8} />
      <Sparkle x="85%" y="18%" size={12} opacity={0.5} />
      <Sparkle x="10%" y="25%" size={14} opacity={0.55} />
      <Sparkle x="88%" y="55%" size={10} opacity={0.45} />
      <Sparkle x="5%" y="65%" size={18} opacity={0.6} />
      <Sparkle x="92%" y="78%" size={12} opacity={0.4} />

      <div className={styles.scrollArea}>
        {/* Floating polaroid photos */}
        {previewPhotos.map((photo, i) => {
          const positions = [
            { left: '-2%', top: '8%', rotate: '-8deg' },
            { left: '-4%', top: '22%', rotate: '5deg' },
            { left: '2%', top: '38%', rotate: '-4deg' },
            { right: '-3%', top: '12%', rotate: '9deg' },
            { right: '-2%', top: '30%', rotate: '-6deg' },
          ]
          const pos = positions[i] || positions[0]
          return (
            <motion.div
              key={photo.id}
              className={styles.polaroid}
              style={pos as React.CSSProperties}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
            >
              <img src={photo.url} alt="" className={styles.polaroidImg} />
            </motion.div>
          )
        })}

        {/* Main card */}
        <motion.div
          className={styles.mainCard}
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        >
          <p className={styles.welcomeTo}>Welcome to the wedding of</p>
          <p className={styles.coupleName}>{wedding.bride}</p>
          <p className={styles.coupleAnd}>and</p>
          <p className={styles.coupleName}>{wedding.groom}</p>
          <div className={styles.cardDivider} />
          {wedding.venue && <p className={styles.venue}>{wedding.venue}</p>}
        </motion.div>

        {/* Date block */}
        <motion.div
          className={styles.dateBlock}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 18 }}
        >
          <span className={styles.dateDay}>{day}</span>
          <span className={styles.dateMonth}>{month}</span>
          <span className={styles.dateYear}>{year}</span>
        </motion.div>

        {/* Location badge */}
        {wedding.location && (
          <motion.div
            className={styles.locationBadge}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            📍 {wedding.location}
          </motion.div>
        )}

        {/* Disco ball decoration */}
        <div className={styles.discoBall}>
          <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
            <circle cx="30" cy="30" r="28" fill="#c0c0c0" opacity="0.6" />
            {Array.from({length:6}).map((_,row) =>
              Array.from({length:6}).map((_,col) => (
                <rect key={`${row}-${col}`}
                  x={8 + col*8} y={8 + row*8}
                  width="6" height="6" rx="1"
                  fill="white" opacity={(row+col)%2===0?0.9:0.3} />
              ))
            )}
          </svg>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <motion.button
            className={styles.actionBtn}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onPhotos}
          >
            <span className={styles.actionIcon}>📸</span>
            <span className={styles.actionLabel}>Live Photos</span>
            <span className={styles.actionCount}>{photos.length}</span>
          </motion.button>

          <motion.button
            className={styles.actionBtn}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onVideos}
          >
            <span className={styles.actionIcon}>🎥</span>
            <span className={styles.actionLabel}>Videos</span>
          </motion.button>

          <motion.button
            className={styles.actionBtn}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onInvite}
          >
            <span className={styles.actionIcon}>💌</span>
            <span className={styles.actionLabel}>Invitation</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
