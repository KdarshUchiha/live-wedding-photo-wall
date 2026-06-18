import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { usePhotos } from '../hooks/usePhotos'
import { RELIGIOUS_THEMES } from '../config/themes'
import type { Wedding } from '../types'
import styles from './WeddingDetailPage.module.css'

interface Props {
  wedding: Wedding
  user: User
  onBack: () => void
  onAlbums: () => void
  onVideos: () => void
  onInvite: () => void
  onGuestbook: () => void
  onTimeline: () => void
}

function Sparkle({ x, y, size = 16, opacity = 0.7 }: { x: string; y: string; size?: number; opacity?: number }) {
  return <span className={styles.sparkle} style={{ left: x, top: y, fontSize: size, opacity }}>✦</span>
}

function PearlString() {
  return (
    <svg className={styles.pearls} viewBox="0 0 200 80" fill="none">
      {Array.from({ length: 18 }).map((_, i) => {
        const t = i / 17
        return <circle key={i} cx={t * 180 + 10} cy={40 + Math.sin(t * Math.PI) * -28} r="5" fill="white" opacity="0.85" />
      })}
    </svg>
  )
}

function Countdown({ date, time }: { date: string; time: string }) {
  const [diff, setDiff] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    const target = new Date(`${date}T${time || '00:00'}:00`)
    const update = () => {
      const now = new Date()
      const ms = target.getTime() - now.getTime()
      if (ms <= 0) { setDiff(null); return }
      const s = Math.floor(ms / 1000)
      setDiff({ days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [date, time])

  if (!diff) return null

  return (
    <motion.div className={styles.countdown} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {[{ v: diff.days, l: 'Days' }, { v: diff.hours, l: 'Hours' }, { v: diff.minutes, l: 'Mins' }, { v: diff.seconds, l: 'Secs' }].map(({ v, l }) => (
        <div key={l} className={styles.countdownUnit}>
          <span className={styles.countdownNum}>{String(v).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{l}</span>
        </div>
      ))}
    </motion.div>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return { day: '', month: '', year: '' }
  const d = new Date(dateStr + 'T12:00:00')
  return { day: d.getDate().toString().padStart(2, '0'), month: d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase(), year: d.getFullYear().toString() }
}

export default function WeddingDetailPage({ wedding, user, onBack, onAlbums, onVideos, onInvite, onGuestbook, onTimeline }: Props) {
  const photos = usePhotos(wedding.id)
  const { day, month, year } = formatDate(wedding.date)
  const isAdmin = user.uid === wedding.createdBy
  const theme = RELIGIOUS_THEMES[wedding.religiousTheme || 'other']
  const previewPhotos = photos.slice(0, 5)
  const today = new Date().toISOString().slice(0, 10)
  const isLive = wedding.date === today
  const isPast = wedding.date < today

  return (
    <div className={styles.page} style={{ background: theme.detailBg }}>
      {isAdmin && <div className={styles.adminBadge}>👑 Managing</div>}
      <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className={styles.pearlsWrap}><PearlString /></div>

      {/* Theme decorations */}
      {theme.decorations.map((d, i) => (
        <Sparkle key={i}
          x={['75%','85%','10%','88%','5%','92%'][i] || '50%'}
          y={['8%','18%','25%','55%','65%','78%'][i] || '50%'}
          size={[20, 12, 14, 10, 18, 12][i]}
          opacity={[0.8, 0.5, 0.55, 0.45, 0.6, 0.4][i]}
        />
      ))}

      {/* Religious theme badge */}
      <div className={styles.themeBadge}>{theme.emoji} {theme.label}</div>

      {/* Live badge */}
      {isLive && (
        <div className={styles.liveBanner}>
          <span className={styles.liveDot} /> HAPPENING NOW
        </div>
      )}

      <div className={styles.scrollArea}>
        {/* Floating polaroid previews */}
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
            <motion.div key={photo.id} className={styles.polaroid} style={pos as React.CSSProperties}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}>
              <img src={photo.url} alt="" className={styles.polaroidImg} />
            </motion.div>
          )
        })}

        {/* Name card */}
        <motion.div className={styles.mainCard}
          initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}>
          <p className={styles.welcomeTo}>Welcome to the wedding of</p>
          <p className={styles.coupleName}>{wedding.bride}</p>
          <p className={styles.coupleAnd}>and</p>
          <p className={styles.coupleName}>{wedding.groom}</p>
          <div className={styles.cardDivider} />
          {wedding.venue && <p className={styles.venue}>{wedding.venue}</p>}
        </motion.div>

        {/* Countdown (only if future) */}
        {!isPast && <Countdown date={wedding.date} time={wedding.time} />}

        {/* Date block */}
        <motion.div className={styles.dateBlock}
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 18 }}>
          <span className={styles.dateDay}>{day}</span>
          <span className={styles.dateMonth}>{month}</span>
          <span className={styles.dateYear}>{year}</span>
        </motion.div>

        {wedding.location && (
          <motion.div className={styles.locationBadge} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            📍 {wedding.location}
          </motion.div>
        )}

        {/* Disco ball */}
        <div className={styles.discoBall}>
          <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
            <circle cx="30" cy="30" r="28" fill="#c0c0c0" opacity="0.6" />
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: 6 }).map((_, col) => (
                <rect key={`${row}-${col}`} x={8 + col * 8} y={8 + row * 8} width="6" height="6" rx="1"
                  fill="white" opacity={(row + col) % 2 === 0 ? 0.9 : 0.3} />
              ))
            )}
          </svg>
        </div>

        {/* Action grid */}
        <div className={styles.actionsGrid}>
          <motion.button className={styles.actionBtn} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onAlbums}>
            <span className={styles.actionIcon}>📸</span>
            <span className={styles.actionLabel}>Photos</span>
            <span className={styles.actionCount}>{photos.length}</span>
          </motion.button>

          <motion.button className={styles.actionBtn} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onVideos}>
            <span className={styles.actionIcon}>🎥</span>
            <span className={styles.actionLabel}>Videos</span>
          </motion.button>

          <motion.button className={styles.actionBtn} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onInvite}>
            <span className={styles.actionIcon}>💌</span>
            <span className={styles.actionLabel}>Invite</span>
          </motion.button>

          <motion.button className={styles.actionBtn} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onGuestbook}>
            <span className={styles.actionIcon}>📖</span>
            <span className={styles.actionLabel}>Wishes</span>
          </motion.button>

          <motion.button className={styles.actionBtn} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onTimeline}>
            <span className={styles.actionIcon}>📅</span>
            <span className={styles.actionLabel}>Timeline</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
