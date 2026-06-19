import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useAlbums } from '../hooks/useAlbums'
import { usePhotos } from '../hooks/usePhotos'
import { createAlbum, deleteAlbum, hashPin, verifyPin, updateAlbumPin } from '../services/albumService'
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
  album, weddingId, isAdmin,
  onOpen, onDelete, onUnlock, onChangePin
}: {
  album: Album
  weddingId: string
  isAdmin: boolean
  onOpen: () => void
  onDelete: () => void
  onUnlock: () => void
  onChangePin: () => void
}) {
  const photos = usePhotos(weddingId, album.id)
  const count = photos.length

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
        <span className={styles.photoCount}>{count} photo{count !== 1 ? 's' : ''}</span>
        {album.isPrivate && <span className={styles.lockBadge}>🔒 Private</span>}
      </div>
      {isAdmin && (
        <div className={styles.adminActions}>
          {album.isPrivate && (
            <button
              className={styles.changePinBtn}
              onClick={(e) => { e.stopPropagation(); onChangePin() }}
              aria-label="Change PIN"
            >
              🔑
            </button>
          )}
          <button
            className={styles.deleteBtn}
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            aria-label="Delete album"
          >
            🗑
          </button>
        </div>
      )}
    </motion.div>
  )
}


function AllPhotosCount({ weddingId }: { weddingId: string }) {
  const photos = usePhotos(weddingId)
  return (
    <div className={styles.cardMeta}>
      <span className={styles.photoCount}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
    </div>
  )
}

export default function AlbumsPage({ wedding, user, onOpen, onBack }: Props) {
  const albums = useAlbums(wedding.id)
  const isAdmin = user.uid === wedding.createdBy

  const [showCreate, setShowCreate] = useState(false)
  const [pinTarget, setPinTarget] = useState<Album | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [changePinTarget, setChangePinTarget] = useState<Album | null>(null)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinChangeError, setPinChangeError] = useState('')
  const [pinChanging, setPinChanging] = useState(false)

  // Create album form
  const [form, setForm] = useState({ name: '', emoji: '📸', description: '', isPrivate: false, pin: '' })
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!form.name) return
    setSaving(true)
    setError(null)
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create album. Check Firestore rules.')
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

  const handleChangePin = async () => {
    if (!changePinTarget) return
    if (newPin.length < 4) { setPinChangeError('PIN must be at least 4 digits'); return }
    if (newPin !== confirmPin) { setPinChangeError('PINs do not match'); return }
    setPinChanging(true)
    setPinChangeError('')
    try {
      await updateAlbumPin(wedding.id, changePinTarget.id, newPin)
      setChangePinTarget(null)
      setNewPin('')
      setConfirmPin('')
    } catch (e) {
      setPinChangeError(e instanceof Error ? e.message : 'Failed to update PIN')
    } finally {
      setPinChanging(false)
    }
  }

  const seedDefaultAlbums = async () => {
    const defaultPinHash = await hashPin('0000')
    for (const a of DEFAULT_ALBUMS) {
      const pinHash = a.isPrivate ? defaultPinHash : ''
      await createAlbum(wedding.id, { ...a, pinHash, createdBy: user.uid })
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
          {/* All Photos card — shows everything including orphaned photos */}
          <motion.div
            className={styles.card}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onOpen({ id: '', name: 'All Photos', emoji: '📷', description: 'Every photo from this wedding', isPrivate: false, pinHash: '', createdBy: '', createdAt: 0, photoCount: 0 })}
          >
            <div className={styles.cardEmoji}>📷</div>
            <h3 className={styles.cardName}>All Photos</h3>
            <p className={styles.cardDesc}>Every photo from this wedding</p>
            <AllPhotosCount weddingId={wedding.id} />
          </motion.div>

          <AnimatePresence>
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                weddingId={wedding.id}
                isAdmin={isAdmin}
                onOpen={() => handleAlbumClick(album)}
                onDelete={() => deleteAlbum(wedding.id, album.id)}
                onUnlock={() => { setPinTarget(album); setPinInput(''); setPinError(false) }}
                onChangePin={() => { setChangePinTarget(album); setNewPin(''); setConfirmPin(''); setPinChangeError('') }}
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
              {error && <p className={styles.errorMsg}>{error}</p>}
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

      {/* Change PIN modal */}
      <AnimatePresence>
        {changePinTarget && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setChangePinTarget(null)}>
            <motion.div className={styles.dialog}
              initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <div className={styles.lockIcon}>🔑</div>
              <h3 className={styles.dialogTitle}>Change PIN</h3>
              <p className={styles.dialogSub}>{changePinTarget.emoji} {changePinTarget.name}</p>
              <input
                className={`${styles.pinInput} ${pinChangeError ? styles.pinError : ''}`}
                type="password" inputMode="numeric" maxLength={8}
                placeholder="New PIN (min 4 digits)"
                value={newPin}
                onChange={(e) => { setNewPin(e.target.value); setPinChangeError('') }}
                autoFocus
              />
              <input
                className={`${styles.pinInput} ${pinChangeError ? styles.pinError : ''}`}
                type="password" inputMode="numeric" maxLength={8}
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => { setConfirmPin(e.target.value); setPinChangeError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleChangePin()}
              />
              {pinChangeError && <p className={styles.pinErrorMsg}>{pinChangeError}</p>}
              <div className={styles.dialogActions}>
                <button className={styles.cancelBtn} onClick={() => setChangePinTarget(null)}>Cancel</button>
                <button className={styles.unlockBtn} onClick={handleChangePin} disabled={pinChanging}>
                  {pinChanging ? 'Saving…' : 'Save PIN'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
