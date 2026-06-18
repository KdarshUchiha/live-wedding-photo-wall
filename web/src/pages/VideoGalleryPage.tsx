import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useVideos } from '../hooks/useVideos'
import { addVideoLink, deleteVideo, getEmbedUrl } from '../services/videoService'
import type { Video, Wedding } from '../types'
import styles from './VideoGalleryPage.module.css'

interface Props { wedding: Wedding; user: User; onBack: () => void }

export default function VideoGalleryPage({ wedding, user, onBack }: Props) {
  const videos = useVideos(wedding.id)
  const [linkInput, setLinkInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    const url = linkInput.trim()
    if (!url) return
    setSaving(true)
    try {
      await addVideoLink(url, user.uid, wedding.id)
      setLinkInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add video')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (video: Video) => {
    try { await deleteVideo(video.id, video.url, wedding.id) }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed') }
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
          <h1 className={styles.title}>Videos</h1>
          <p className={styles.subtitle}>{wedding.bride} &amp; {wedding.groom}</p>
        </div>
      </header>

      {/* Add video link bar */}
      <div className={styles.addBar}>
        <input
          className={styles.linkInput}
          placeholder="Paste a YouTube, Vimeo, or Google Drive link…"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
        />
        <button className={styles.addBtn} onClick={handleAdd} disabled={saving || !linkInput.trim()}>
          {saving ? '…' : 'Add'}
        </button>
      </div>

      <main className={styles.main}>
        {videos.length === 0 ? (
          <div className={styles.empty}>
            <span>🎥</span>
            <h2>No videos yet</h2>
            <p>Paste a YouTube, Vimeo, or Google Drive link above to share a video.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {videos.map((video) => {
              const embedUrl = getEmbedUrl(video.url)
              return (
                <motion.div key={video.id} className={styles.videoCard}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 18 }}>

                  {playing === video.id && embedUrl ? (
                    <div className={styles.embedWrap}>
                      <iframe
                        src={embedUrl}
                        className={styles.embed}
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={video.filename}
                      />
                    </div>
                  ) : (
                    <button className={styles.videoThumb} onClick={() => setPlaying(video.id)}>
                      <div className={styles.thumbPlaceholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="white" opacity="0.9">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </button>
                  )}

                  <div className={styles.videoMeta}>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoName}>
                      {video.filename}
                    </a>
                    {user.uid === video.uploaderId && (
                      <button className={styles.deleteBtn} onClick={() => handleDelete(video)}>🗑</button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      {error && (
        <div className={styles.errorOverlay} onClick={() => setError(null)}>
          <div className={styles.errorDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Error</h3><p>{error}</p>
            <button onClick={() => setError(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
