import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { Album } from '../types'

export function useAlbums(weddingId: string) {
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    if (!weddingId) return
    const q = query(collection(db, 'weddings', weddingId, 'albums'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, (snap) => {
      setAlbums(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Album, 'id'>) })))
    })
  }, [weddingId])

  return albums
}
