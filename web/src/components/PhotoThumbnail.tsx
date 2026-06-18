import { useMemo } from 'react'
import type { Photo } from '../types'
import styles from './PhotoThumbnail.module.css'

interface Props {
  photo: Photo
  onClick: () => void
}

export default function PhotoThumbnail({ photo, onClick }: Props) {
  const tilt = useMemo(() => {
    const hash = photo.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return ((hash % 600) / 100) - 3
  }, [photo.id])

  return (
    <button
      className={styles.card}
      style={{ '--tilt': `${tilt}deg` } as React.CSSProperties}
      onClick={onClick}
      aria-label="View photo"
    >
      <div className={styles.imageWrap}>
        <img
          src={photo.url}
          alt=""
          loading="lazy"
          className={styles.image}
        />
      </div>
    </button>
  )
}
