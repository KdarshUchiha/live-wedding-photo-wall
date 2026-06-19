import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReactions, REACTIONS } from '../hooks/useReactions'
import type { Photo } from '../types'
import styles from './PhotoDetail.module.css'

interface Props {
  photos: Photo[]
  initialIndex: number
  weddingId: string
  userId: string
  canDelete: (photo: Photo) => boolean
  onDelete: (photo: Photo) => void
  onClose: () => void
  onIndexChange: (index: number) => void
}

export default function PhotoDetail({
  photos,
  initialIndex,
  weddingId,
  userId,
  canDelete,
  onDelete,
  onClose,
  onIndexChange,
}: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const current = photos[index]
  const { counts, myReaction, toggle } = useReactions(weddingId, current?.id || '', userId)

  const go = useCallback(
    (dir: -1 | 1) => {
      const next = Math.max(0, Math.min(photos.length - 1, index + dir))
      setIndex(next)
      onIndexChange(next)
    },
    [index, photos.length, onIndexChange]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, onClose])

  if (!current) return null

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className={styles.topBar} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <span className={styles.counter}>{index + 1} / {photos.length}</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Photo */}
      <motion.div
        key={current.id}
        className={styles.imageContainer}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={current.url} alt="" className={styles.image} />
      </motion.div>

      {/* Arrow navigation */}
      {index > 0 && (
        <button
          className={`${styles.navBtn} ${styles.navLeft}`}
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          aria-label="Previous photo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          className={`${styles.navBtn} ${styles.navRight}`}
          onClick={(e) => { e.stopPropagation(); go(1) }}
          aria-label="Next photo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}

      {/* Reactions */}
      <div className={styles.reactions} onClick={(e) => e.stopPropagation()}>
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            className={`${styles.reactionBtn} ${myReaction === emoji ? styles.reactionBtnActive : ''}`}
            onClick={() => toggle(emoji)}
          >
            {emoji}
            {counts[emoji] ? <span className={styles.reactionCount}>{counts[emoji]}</span> : null}
          </button>
        ))}
      </div>

      {/* Delete button */}
      {canDelete(current) && (
        <div className={styles.bottomBar} onClick={(e) => e.stopPropagation()}>
          {!showDeleteConfirm ? (
            <button
              className={styles.deleteBtn}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete photo
            </button>
          ) : (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Delete this photo?</span>
              <button
                className={styles.confirmDeleteBtn}
                onClick={() => { setShowDeleteConfirm(false); onDelete(current) }}
              >
                Delete
              </button>
              <button
                className={styles.confirmCancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
