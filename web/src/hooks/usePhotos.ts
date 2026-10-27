import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import type { Photo } from '../types'

export function usePhotos(weddingId: string, albumId?: string) {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    if (!weddingId) return
    const constraints = albumId
      ? [where('albumId', '==', albumId), orderBy('timestamp', 'desc')]
      : [orderBy('timestamp', 'desc')]
    const q = query(collection(db, 'weddings', weddingId, 'photos'), ...constraints)
    return onSnapshot(q,
      (snap) => {
        const now = Date.now()
        setPhotos(snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Photo, 'id'>) }))
          // Expired free-tier photos disappear for guests immediately, before the couple's cleanup runs.
          .filter((p) => !p.expireAt || p.expireAt.toMillis() > now))
      },
      (error) => {
        console.error('[usePhotos] Firestore error:', error.message)
        if (error.message.includes('index')) {
          console.error('[usePhotos] A composite index is required. Check Firebase Console → Firestore → Indexes. You need: Collection group: photos, Fields: albumId ASC + timestamp DESC')
        }
      }
    )
  }, [weddingId, albumId])

  return photos
}
