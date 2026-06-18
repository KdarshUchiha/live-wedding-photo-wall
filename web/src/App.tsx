import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { usePhotos } from './hooks/usePhotos'
import { uploadPhoto, deletePhoto } from './services/photoService'
import PhotoThumbnail from './components/PhotoThumbnail'
import PhotoDetail from './components/PhotoDetail'
import type { Photo, UploadState } from './types'
import styles from './App.module.css'

export default function App() {
  const user = useAuth()
  const photos = usePhotos()
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || !files.length || !user) return
    const arr = Array.from(files)
    setUploadState({ status: 'uploading', progress: 0 })
    try {
      for (let i = 0; i < arr.length; i++) {
        await uploadPhoto(arr[i], user.uid)
        setUploadState({ status: 'uploading', progress: (i + 1) / arr.length })
      }
      setUploadState({ status: 'done' })
      setTimeout(() => setUploadState({ status: 'idle' }), 2000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      setUploadState({ status: 'failed', message: msg })
      setError(msg)
    }
  }

  const handleDelete = async (photo: Photo) => {
    try {
      await deletePhoto(photo.id, photo.url)
      if (selectedIndex !== null && selectedIndex >= photos.length - 1) {
        setSelectedIndex(photos.length > 1 ? photos.length - 2 : null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const canDelete = (photo: Photo) => user?.uid === photo.uploaderId

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Photo Wall</h1>
        <p className={styles.subtitle}>Share your moments from the big day</p>
      </header>

      {/* Upload progress bar */}
      <AnimatePresence>
        {uploadState.status === 'uploading' && (
          <motion.div
            className={styles.progressBar}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: uploadState.progress, opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ transformOrigin: 'left' }}
          />
        )}
      </AnimatePresence>

      {/* Upload success toast */}
      <AnimatePresence>
        {uploadState.status === 'done' && (
          <motion.div
            className={styles.toast}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            ✓ Photos uploaded!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={styles.main}>
        {photos.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📸</span>
            <h2>Be the first to share your memories!</h2>
            <p>Tap "Add photos" below to start the gallery.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ scale: 0.1, opacity: 0, y: -40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.1, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 14,
                    stiffness: 200,
                    mass: 0.8,
                  }}
                >
                  <PhotoThumbnail
                    photo={photo}
                    onClick={() => setSelectedIndex(index)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating Add Photos button */}
      <div className={styles.fabContainer}>
        <button
          className={styles.fab}
          onClick={() => fileInputRef.current?.click()}
          disabled={!user}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Add photos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFilesSelected(e.target.files)}
          onClick={(e) => ((e.target as HTMLInputElement).value = '')}
        />
      </div>

      {/* Full-screen detail view */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <PhotoDetail
            photos={photos}
            initialIndex={selectedIndex}
            canDelete={canDelete}
            onDelete={handleDelete}
            onClose={() => setSelectedIndex(null)}
            onIndexChange={setSelectedIndex}
          />
        )}
      </AnimatePresence>

      {/* Error dialog */}
      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setError(null)}
          >
            <div className={styles.errorDialog} onClick={(e) => e.stopPropagation()}>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className={styles.errorBtn} onClick={() => setError(null)}>OK</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
