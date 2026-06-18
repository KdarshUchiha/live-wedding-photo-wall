import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { Video } from '../types'

export function useVideos(weddingId: string) {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    if (!weddingId) return
    const q = query(
      collection(db, 'weddings', weddingId, 'videos'),
      orderBy('timestamp', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setVideos(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Video, 'id'>) })))
    })
  }, [weddingId])

  return videos
}
