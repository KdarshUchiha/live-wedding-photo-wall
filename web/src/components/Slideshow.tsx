import { useCallback, useEffect, useState } from 'react'
import type { Photo } from '../types'
import styles from './Slideshow.module.css'

interface Props {
  photos: Photo[]
  onClose: () => void
}

export default function Slideshow({ photos, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length)
  }, [photos.length])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  const togglePause = useCallback(() => {
    setPaused((p) => !p)
  }, [])

  useEffect(() => {
    if (paused || photos.length <= 1) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [paused, next, photos.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === ' ') { e.preventDefault(); togglePause() }
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, togglePause, next, prev])

  if (photos.length === 0) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.imageWrap}>
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.url}
            alt=""
            className={`${styles.image} ${i === index ? styles.imageActive : ''}`}
          />
        ))}
      </div>

      <div className={styles.bottomBar}>
        <span className={styles.counter}>{index + 1} / {photos.length}</span>
        <div className={styles.controls}>
          <button className={styles.controlBtn} onClick={prev} aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className={styles.controlBtn} onClick={togglePause} aria-label={paused ? 'Play' : 'Pause'}>
            {paused ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
          <button className={styles.controlBtn} onClick={next} aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close slideshow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
