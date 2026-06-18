import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { useVideos } from '../hooks/useVideos'
import { uploadVideo, deleteVideo } from '../services/videoService'
import type { UploadState, Video, Wedding } from '../types'
import styles from './VideoGalleryPage.module.css'

interface Props { wedding: Wedding; user: User; onBack: () => void }

export default function VideoGalleryPage({ wedding, user, onBack }: Props) {
  const videos = useVideos(wedding.id)
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })
  const [playing, setPlaying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const arr = Array.from(files)
    setUploadState({ status: 'uploading', progress: 0 })
    try {
      for (let i = 0; i < arr.length; i++) {
        await uploadVideo(arr[i], user.uid, wedding.id)
        setUploadState({ status: 'uploading', progress: (i + 1) / arr.length })
      }
      setUploadState({ status: 'done' })
      setTimeout(() => setUploadState({ status: 'idle' }), 2000)
    } catch (e) {
      setUploadState({ status: 'failed', message: '' })
      setError(e instanceof Error ? e.message : 'Upload failed')
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

      <AnimatePresence>
        {uploadState.status === 'uploading' && (
          <motion.div className={styles.progressBar}
            initial={{ scaleX: 0 }} animate={{ scaleX: uploadState.progress }}
            exit={{ opacity: 0 }} style={{ transformOrigin: 'left' }} />
        )}
        {uploadState.status === 'done' && (
          <motion.div className={styles.toast}
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}>
            ✓ Video uploaded!
          </motion.div>
        )}
      </AnimatePresence>

      <main className={styles.main}>
        {videos.length === 0 ? (
          <div className={styles.empty}>
            <span>🎥</span>
            <h2>No videos yet</h2>
            <p>Upload the first video from this special day!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {videos.map((video) => (
              <motion.div key={video.id} className={styles.videoCard}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 18 }}>
                {playing === video.id ? (
                  <video src={video.url} controls autoPlay className={styles.video}
                    onEnded={() => setPlaying(null)} />
                ) : (
                  <button className={styles.videoThumb} onClick={() => setPlaying(video.id)}>
                    <video src={video.url} className={styles.video} preload="metadata" />
                    <div className={styles.playBtn}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </button>
                )}
                <div className={styles.videoMeta}>
                  <span className={styles.videoName}>{video.filename}</span>
                  {user.uid === video.uploaderId && (
                    <button className={styles.deleteBtn} onClick={() => handleDelete(video)}>
                      🗑
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <div className={styles.fabWrap}>
        <button className={styles.fab} onClick={() => fileInputRef.current?.click()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          Upload video
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => ((e.target as HTMLInputElement).value = '')} />
      </div>

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
