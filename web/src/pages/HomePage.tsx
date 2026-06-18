import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useWeddings } from '../hooks/useWeddings'
import { createWedding } from '../services/weddingService'
import EnvelopeCard from '../components/EnvelopeCard'
import type { Wedding } from '../types'
import styles from './HomePage.module.css'

const THEME_COLORS = ['#8B1A1A','#C4A882','#1B3A6B','#7B8C5A','#6B3FA0','#B5534A']

interface Props {
  user: User
  onOpen: (w: Wedding) => void
}

export default function HomePage({ user, onOpen }: Props) {
  const weddings = useWeddings()
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    bride: '', groom: '', date: '', time: '', venue: '', location: '', themeColor: '#8B1A1A',
  })
  const [saving, setSaving] = useState(false)

  const now = new Date().toISOString().slice(0, 10)
  const upcoming = weddings.filter((w) => w.date >= now)
  const archive = weddings.filter((w) => w.date < now)
  const featured = upcoming[0]
  const rest = tab === 'upcoming' ? upcoming.slice(1) : archive

  const handleCreate = async () => {
    if (!form.bride || !form.groom || !form.date) return
    setSaving(true)
    try {
      await createWedding({ ...form, createdBy: user.uid })
      setShowCreate(false)
      setForm({ bride: '', groom: '', date: '', time: '', venue: '', location: '', themeColor: '#8B1A1A' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.appTitle}>Wedding Wall</h1>
        <p className={styles.tagline}>Your memories, beautifully shared</p>
      </header>

      <div className={styles.content}>
        {/* Featured */}
        {featured && (
          <section className={styles.featuredSection}>
            <span className={styles.nextUpLabel}>✦ Next up</span>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              <EnvelopeCard wedding={featured} size="large" onClick={() => onOpen(featured)} />
            </motion.div>
          </section>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'upcoming' ? styles.tabActive : ''}`}
            onClick={() => setTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`${styles.tab} ${tab === 'archive' ? styles.tabActive : ''}`}
            onClick={() => setTab('archive')}
          >
            Archive
          </button>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          <AnimatePresence>
            {rest.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 18, stiffness: 280 }}
              >
                <EnvelopeCard wedding={w} size="small" onClick={() => onOpen(w)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {rest.length === 0 && (
            <p className={styles.emptyMsg}>
              {tab === 'upcoming' ? 'No more upcoming weddings.' : 'No archived weddings yet.'}
            </p>
          )}
        </div>
      </div>

      {/* + FAB */}
      <motion.button
        className={styles.fab}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setShowCreate(true)}
        aria-label="Add wedding"
      >
        +
      </motion.button>

      {/* Create Wedding Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.modalTitle}>New Wedding</h2>

              <div className={styles.formRow}>
                <input className={styles.input} placeholder="Bride's name" value={form.bride}
                  onChange={(e) => setForm({ ...form, bride: e.target.value })} />
                <input className={styles.input} placeholder="Groom's name" value={form.groom}
                  onChange={(e) => setForm({ ...form, groom: e.target.value })} />
              </div>
              <div className={styles.formRow}>
                <input className={styles.input} type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <input className={styles.input} type="time" value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <input className={styles.input} placeholder="Venue name" value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              <input className={styles.input} placeholder="City, Country" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />

              <div className={styles.colorRow}>
                <span className={styles.colorLabel}>Theme colour</span>
                <div className={styles.colorSwatches}>
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`${styles.swatch} ${form.themeColor === c ? styles.swatchActive : ''}`}
                      style={{ background: c }}
                      onClick={() => setForm({ ...form, themeColor: c })}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                <button className={styles.createBtn} onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creating…' : 'Create Wedding'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
