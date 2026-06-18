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
        setPhotos(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Photo, 'id'>) })))
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
