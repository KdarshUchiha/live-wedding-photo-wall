import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useGuestbook } from '../hooks/useGuestbook'
import { addGuestbookEntry, deleteGuestbookEntry } from '../services/guestbookService'
import type { Wedding } from '../types'
import styles from './GuestbookPage.module.css'

interface Props { wedding: Wedding; user: User; onBack: () => void }

const WISHES = ['🥂','💍','❤️','🎊','🌸','✨','💐','🕊️','🌹','💒']

export default function GuestbookPage({ wedding, user, onBack }: Props) {
  const entries = useGuestbook(wedding.id)
  const isAdmin = user.uid === wedding.createdBy
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState('❤️')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return
    setSaving(true)
    try {
      await addGuestbookEntry(wedding.id, `${emoji} ${name.trim()}`, message.trim(), user.uid)
      setName('')
      setMessage('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className={styles.title}>Guestbook</h1>
          <p className={styles.subtitle}>{entries.length} wishes for {wedding.bride} &amp; {wedding.groom}</p>
        </div>
      </header>

      {/* Write a wish */}
      <div className={styles.compose}>
        <div className={styles.emojiPicker}>
          {WISHES.map((e) => (
            <button key={e} className={`${styles.emojiBtn} ${emoji === e ? styles.emojiActive : ''}`}
              onClick={() => setEmoji(e)}>{e}</button>
          ))}
        </div>
        <input className={styles.input} placeholder="Your name" value={name}
          onChange={(e) => setName(e.target.value)} maxLength={60} />
        <textarea className={styles.textarea} placeholder="Leave your wishes for the couple…"
          value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={500} />
        <button className={styles.submitBtn} onClick={handleSubmit}
          disabled={saving || !name.trim() || !message.trim()}>
          {saving ? 'Sending…' : '💌 Send Wishes'}
        </button>
      </div>

      {/* Entries */}
      <div className={styles.entries}>
        <AnimatePresence>
          {entries.map((entry, i) => (
            <motion.div key={entry.id} className={styles.entry}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, type: 'spring', damping: 18 }}>
              <div className={styles.entryTop}>
                <span className={styles.guestName}>{entry.guestName}</span>
                <span className={styles.entryTime}>
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
              <p className={styles.entryMsg}>{entry.message}</p>
              {(isAdmin || user.uid === entry.uploaderId) && (
                <button className={styles.deleteBtn}
                  onClick={() => deleteGuestbookEntry(wedding.id, entry.id)}>🗑</button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <div className={styles.empty}>
            <p>Be the first to leave a wish! 💌</p>
          </div>
        )}
      </div>
    </div>
  )
}
