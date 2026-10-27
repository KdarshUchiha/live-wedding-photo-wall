import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { usePhotos } from '../hooks/usePhotos'
import { uploadPhoto, deletePhoto } from '../services/photoService'
import { downloadAllPhotos } from '../utils/downloadPhotos'
import PhotoThumbnail from '../components/PhotoThumbnail'
import PhotoDetail from '../components/PhotoDetail'
import Slideshow from '../components/Slideshow'
import UpgradeModal from '../components/UpgradeModal'
import { isPhotoLimitReached, planOf, photosRemaining } from '../config/plans'
import type { Album, Photo, UploadState, Wedding } from '../types'
import styles from './PhotoGalleryPage.module.css'

interface Props {
  wedding: Wedding
  album: Album
  user: User
  isAdmin: boolean
  onBack: () => void
}

export default function PhotoGalleryPage({ wedding, album, user, isAdmin, onBack }: Props) {
  const photos = usePhotos(wedding.id, album.id || undefined)
  // The photo cap is per event (all albums), so count against the unfiltered list.
  const allPhotos = usePhotos(wedding.id)
  const plan = planOf(wedding)
  const limitReached = isPhotoLimitReached(wedding, allPhotos.length)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const remaining = photosRemaining(wedding, allPhotos.length)
    if (remaining === 0) { setShowUpgrade(true); return }
    const all = Array.from(files)
    const arr = all.slice(0, remaining)
    setUploadState({ status: 'uploading', progress: 0 })
    try {
      for (let i = 0; i < arr.length; i++) {
        await uploadPhoto(arr[i], user.uid, wedding.id, album.id)
        setUploadState({ status: 'uploading', progress: (i + 1) / arr.length })
      }
      setUploadState({ status: 'done' })
      setTimeout(() => setUploadState({ status: 'idle' }), 2000)
      if (arr.length < all.length) setShowUpgrade(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      setUploadState({ status: 'failed', message: msg })
      setError(msg)
    }
  }

  const handleDownload = async () => {
    if (downloadProgress !== null) return
    setDownloadProgress(0)
    try {
      await downloadAllPhotos(photos, {
        albumName: `${wedding.bride}-${wedding.groom}-${album.name}`,
        onProgress: setDownloadProgress,
        watermark: plan.watermark,
        watermarkText: `${wedding.bride} & ${wedding.groom}`,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed')
    } finally {
      setDownloadProgress(null)
    }
  }

  // TODO: wire Stripe Checkout / RevenueCat, then set wedding.plan = 'pro' on success.
  const handleUpgrade = () => {
    setShowUpgrade(false)
    setError('Payments are coming soon — Event Pass checkout is not live yet.')
  }

  const handleDelete = async (photo: Photo) => {
    try {
      await deletePhoto(photo.id, photo.url, wedding.id)
      if (selectedIndex !== null && selectedIndex >= photos.length - 1)
        setSelectedIndex(photos.length > 1 ? photos.length - 2 : null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed') }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className={styles.title}>{album.emoji} {album.name}</h1>
          <p className={styles.subtitle}>
            {wedding.bride} &amp; {wedding.groom}
            {plan.photoLimit !== null && (
              <> · {allPhotos.length}/{plan.photoLimit} photos ·{' '}
                <button className={styles.upgradeLink} onClick={() => setShowUpgrade(true)}>Upgrade</button>
              </>
            )}
          </p>
        </div>
        {photos.length > 0 && (
          <>
            <button className={styles.slideshowBtn} onClick={handleDownload} disabled={downloadProgress !== null}>
              {downloadProgress === null ? '⬇ Download' : `Zipping ${Math.round(downloadProgress * 100)}%`}
            </button>
            <button className={styles.slideshowBtn} onClick={() => setShowSlideshow(true)}>
              ▶ Slideshow
            </button>
          </>
        )}
        {isAdmin && <span className={styles.adminBadge}>👑 Admin</span>}
      </header>

      {/* Progress */}
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
            ✓ Photos uploaded!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <main className={styles.main}>
        {photos.length === 0 ? (
          <div className={styles.empty}>
            <span>📸</span>
            <h2>No photos yet</h2>
            <p>Be the first to share your memories!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            <AnimatePresence>
              {photos.map((photo, i) => (
                <motion.div key={photo.id} layout
                  initial={{ scale: 0.1, opacity: 0, y: -30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.1, opacity: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 200 }}>
                  <PhotoThumbnail photo={photo} onClick={() => setSelectedIndex(i)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <div className={styles.fabWrap}>
        <button className={styles.fab}
          onClick={() => (limitReached ? setShowUpgrade(true) : fileInputRef.current?.click())}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          {limitReached ? 'Photo limit reached' : 'Add photos'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => ((e.target as HTMLInputElement).value = '')} />
      </div>

      {/* Detail view */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <PhotoDetail
            photos={photos} initialIndex={selectedIndex}
            weddingId={wedding.id}
            userId={user.uid}
            canDelete={(p) => isAdmin || user.uid === p.uploaderId}
            onDelete={handleDelete}
            onClose={() => setSelectedIndex(null)}
            onIndexChange={setSelectedIndex} />
        )}
      </AnimatePresence>

      {showSlideshow && photos.length > 0 && (
        <Slideshow photos={photos} onClose={() => setShowSlideshow(false)} />
      )}

      {showUpgrade && (
        <UpgradeModal photoCount={allPhotos.length} onUpgrade={handleUpgrade} onClose={() => setShowUpgrade(false)} />
      )}

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
