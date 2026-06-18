import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { Photo } from '../types'

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('timestamp', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      setPhotos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Photo, 'id'>),
        }))
      )
    })
    return unsub
  }, [])

  return photos
}
