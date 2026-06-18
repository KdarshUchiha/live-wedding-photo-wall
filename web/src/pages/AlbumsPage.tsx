import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useAlbums } from '../hooks/useAlbums'
import { usePhotos } from '../hooks/usePhotos'
import { createAlbum, deleteAlbum, hashPin, verifyPin } from '../services/albumService'
import { DEFAULT_ALBUMS } from '../config/themes'
import type { Album, Wedding } from '../types'
import styles from './AlbumsPage.module.css'

interface Props {
  wedding: Wedding
  user: User
  onOpen: (album: Album) => void
  onBack: () => void
}

function AlbumCard({
  album, isAdmin, totalPhotos,
  onOpen, onDelete, onUnlock
}: {
  album: Album
  isAdmin: boolean
  totalPhotos: number
  onOpen: () => void
  onDelete: () => void
  onUnlock: () => void
}) {
  return (
    <motion.div
      className={`${styles.card} ${album.isPrivate ? styles.privateCard : ''}`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 16, stiffness: 280 }}
      onClick={album.isPrivate ? onUnlock : onOpen}
    >
      <div className={styles.cardEmoji}>{album.emoji}</div>
      <h3 className={styles.cardName}>{album.name}</h3>
      <p className={styles.cardDesc}>{album.description}</p>
      <div className={styles.cardMeta}>
        <span className={styles.photoCount}>{totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}</span>
        {album.isPrivate && <span className={styles.lockBadge}>🔒 Private</span>}
      </div>
      {isAdmin && (
        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Delete album"
        >
          🗑
        </button>
      )}
    </motion.div>
  )
}

function PhotoCountBadge({ weddingId, albumId }: { weddingId: string; albumId: string }) {
  const photos = usePhotos(weddingId, albumId)
  return <>{photos.length}</>
}

export default function AlbumsPage({ wedding, user, onOpen, onBack }: Props) {
  const albums = useAlbums(wedding.id)
  const isAdmin = user.uid === wedding.createdBy

  const [showCreate, setShowCreate] = useState(false)
  const [pinTarget, setPinTarget] = useState<Album | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())

  // Create album form
  const [form, setForm] = useState({ name: '', emoji: '📸', description: '', isPrivate: false, pin: '' })
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const pinHash = form.isPrivate && form.pin ? await hashPin(form.pin) : ''
      await createAlbum(wedding.id, {
        name: form.name,
        emoji: form.emoji,
        description: form.description,
        isPrivate: form.isPrivate,
        pinHash,
        createdBy: user.uid,
      })
      setShowCreate(false)
      setForm({ name: '', emoji: '📸', description: '', isPrivate: false, pin: '' })
    } finally {
      setSaving(false)
    }
  }

  const handleUnlock = async () => {
    if (!pinTarget) return
    const ok = await verifyPin(pinInput, pinTarget.pinHash)
    if (ok) {
      setUnlocked((prev) => new Set([...prev, pinTarget.id]))
      setPinTarget(null)
      setPinInput('')
      setPinError(false)
      onOpen(pinTarget)
    } else {
      setPinError(true)
    }
  }

  const handleAlbumClick = (album: Album) => {
    if (album.isPrivate && !isAdmin && !unlocked.has(album.id)) {
      setPinTarget(album)
    } else {
      onOpen(album)
    }
  }

  const seedDefaultAlbums = async () => {
    for (const a of DEFAULT_ALBUMS) {
      await createAlbum(wedding.id, { ...a, pinHash: '', createdBy: user.uid })
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
          <h1 className={styles.title}>Photo Albums</h1>
          <p className={styles.subtitle}>{wedding.bride} &amp; {wedding.groom}</p>
        </div>
        {isAdmin && (
          <button className={styles.addBtn} onClick={() => setShowCreate(true)}>+ Album</button>
        )}
      </header>

      <main className={styles.main}>
        {albums.length === 0 && isAdmin && (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No albums yet.</p>
            <button className={styles.seedBtn} onClick={seedDefaultAlbums}>
              ✨ Create default albums
            </button>
          </div>
        )}
        {albums.length === 0 && !isAdmin && (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No albums have been created yet.</p>
          </div>
        )}
        <div className={styles.grid}>
          <AnimatePresence>
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                isAdmin={isAdmin}
                totalPhotos={0}
                onOpen={() => handleAlbumClick(album)}
                onDelete={() => deleteAlbum(wedding.id, album.id)}
                onUnlock={() => { setPinTarget(album); setPinInput(''); setPinError(false) }}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* PIN unlock dialog */}
      <AnimatePresence>
        {pinTarget && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPinTarget(null)}>
            <motion.div className={styles.dialog}
              initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <div className={styles.lockIcon}>🔒</div>
              <h3 className={styles.dialogTitle}>{pinTarget.emoji} {pinTarget.name}</h3>
              <p className={styles.dialogSub}>This album is private. Enter the PIN to unlock.</p>
              <input
                className={`${styles.pinInput} ${pinError ? styles.pinError : ''}`}
                type="password" inputMode="numeric" maxLength={8}
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                autoFocus
              />
              {pinError && <p className={styles.pinErrorMsg}>Incorrect PIN. Try again.</p>}
              <div className={styles.dialogActions}>
                <button className={styles.cancelBtn} onClick={() => setPinTarget(null)}>Cancel</button>
                <button className={styles.unlockBtn} onClick={handleUnlock}>Unlock</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create album modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}>
            <motion.div className={styles.modal}
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>New Album</h2>
              <div className={styles.emojiRow}>
                {['📸','💒','🥂','🎉','💄','🕺','💃','🌸','✨','🎊','🌹','💍'].map((e) => (
                  <button key={e} className={`${styles.emojiBtn} ${form.emoji === e ? styles.emojiBtnActive : ''}`}
                    onClick={() => setForm({ ...form, emoji: e })}>{e}</button>
                ))}
              </div>
              <input className={styles.input} placeholder="Album name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.input} placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label className={styles.toggle}>
                <input type="checkbox" checked={form.isPrivate}
                  onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />
                <span>🔒 Private album (PIN required)</span>
              </label>
              {form.isPrivate && (
                <input className={styles.input} type="password" inputMode="numeric" placeholder="Set PIN (4-8 digits)"
                  maxLength={8} value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })} />
              )}
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                <button className={styles.createBtn} onClick={handleCreate} disabled={saving || !form.name}>
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
