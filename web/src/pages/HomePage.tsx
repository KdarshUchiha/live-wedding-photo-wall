import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useWeddings } from '../hooks/useWeddings'
import { createWedding, deleteWedding } from '../services/weddingService'
import EnvelopeCard from '../components/EnvelopeCard'
import { RELIGIOUS_THEMES } from '../config/themes'
import type { ReligiousTheme, Wedding } from '../types'
import styles from './HomePage.module.css'

const THEME_COLORS = ['#8B1A1A','#C4A882','#1B3A6B','#7B8C5A','#6B3FA0','#B5534A']
const RELIGIOUS_OPTIONS = Object.entries(RELIGIOUS_THEMES) as [ReligiousTheme, typeof RELIGIOUS_THEMES[ReligiousTheme]][]

type Tab = 'live' | 'upcoming' | 'archive'

function weddingStatus(w: Wedding): 'live' | 'upcoming' | 'archive' {
  const today = new Date().toISOString().slice(0, 10)
  if (w.date === today) return 'live'
  if (w.date > today) return 'upcoming'
  return 'archive'
}

interface Props {
  user: User
  onOpen: (w: Wedding) => void
}

export default function HomePage({ user, onOpen }: Props) {
  const weddings = useWeddings()
  const [tab, setTab] = useState<Tab>('live')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Wedding | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    bride: '', groom: '', date: '', time: '', venue: '', location: '',
    themeColor: '#8B1A1A', religiousTheme: 'other' as ReligiousTheme, timeline: [],
  })
  const [saving, setSaving] = useState(false)

  const live     = weddings.filter((w) => weddingStatus(w) === 'live')
  const upcoming = weddings.filter((w) => weddingStatus(w) === 'upcoming')
  const archive  = weddings.filter((w) => weddingStatus(w) === 'archive')

  // Auto-switch to first non-empty tab on load
  const activeTab = tab

  const listed = activeTab === 'live' ? live : activeTab === 'upcoming' ? upcoming : archive

  // The featured card: live first, else next upcoming
  const featured = live[0] ?? upcoming[0]

  const handleCreate = async () => {
    if (!form.bride || !form.groom || !form.date) return
    setSaving(true)
    try {
      await createWedding({ ...form, createdBy: user.uid })
      setShowCreate(false)
      setForm({ bride: '', groom: '', date: '', time: '', venue: '', location: '', themeColor: '#8B1A1A', religiousTheme: 'other', timeline: [] })
      // Switch to relevant tab after creation
      const status = weddingStatus({ date: form.date } as Wedding)
      setTab(status)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteWedding(deleteTarget.id)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const tabCounts: Record<Tab, number> = { live: live.length, upcoming: upcoming.length, archive: archive.length }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.appTitle}>Wedding Wall</h1>
        <p className={styles.tagline}>Your memories, beautifully shared</p>
      </header>

      <div className={styles.content}>
        {/* Featured card */}
        {featured && (
          <section className={styles.featuredSection}>
            <span className={styles.nextUpLabel}>
              {weddingStatus(featured) === 'live' ? '🔴 Happening now' : '✦ Next up'}
            </span>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              <EnvelopeCard
                wedding={featured}
                size="large"
                status={weddingStatus(featured)}
                canDelete={user.uid === featured.createdBy}
                onClick={() => onOpen(featured)}
                onDelete={(e) => { e.stopPropagation(); setDeleteTarget(featured) }}
              />
            </motion.div>
          </section>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['live', 'upcoming', 'archive'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'live' ? '🔴 Live' : t === 'upcoming' ? 'Upcoming' : 'Archive'}
              {tabCounts[t] > 0 && (
                <span className={`${styles.tabCount} ${activeTab === t ? styles.tabCountActive : ''}`}>
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {listed.map((w, i) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, type: 'spring', damping: 18, stiffness: 280 }}
              >
                <EnvelopeCard
                  wedding={w}
                  size="small"
                  status={weddingStatus(w)}
                  canDelete={user.uid === w.createdBy}
                  onClick={() => onOpen(w)}
                  onDelete={(e) => { e.stopPropagation(); setDeleteTarget(w) }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {listed.length === 0 && (
            <motion.p
              className={styles.emptyMsg}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {activeTab === 'live'
                ? 'No weddings happening today.'
                : activeTab === 'upcoming'
                ? 'No upcoming weddings. Tap + to add one!'
                : 'No completed weddings yet.'}
            </motion.p>
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

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              className={styles.modal}
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.modalTitle}>Delete Wedding?</h2>
              <p className={styles.deleteWarning}>
                This will permanently delete <strong>{deleteTarget.bride} &amp; {deleteTarget.groom}</strong>'s
                wedding and all their photos and videos. This cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className={styles.deleteConfirmBtn} onClick={handleDeleteConfirm} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Wedding Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

              <div className={styles.colorRow}>
                <span className={styles.colorLabel}>Religious ceremony</span>
                <div className={styles.religiousGrid}>
                  {RELIGIOUS_OPTIONS.map(([key, cfg]) => (
                    <button
                      key={key}
                      className={`${styles.religiousBtn} ${form.religiousTheme === key ? styles.religiousBtnActive : ''}`}
                      style={form.religiousTheme === key ? { borderColor: cfg.primaryColor, background: cfg.primaryColor + '18' } : {}}
                      onClick={() => setForm({ ...form, religiousTheme: key, themeColor: cfg.primaryColor })}
                    >
                      <span>{cfg.emoji}</span>
                      <span className={styles.religiousLabel}>{cfg.label}</span>
                    </button>
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
