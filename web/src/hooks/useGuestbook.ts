import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { GuestbookEntry } from '../types'

export function useGuestbook(weddingId: string) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])

  useEffect(() => {
    if (!weddingId) return
    const q = query(collection(db, 'weddings', weddingId, 'guestbook'), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<GuestbookEntry, 'id'>) })))
    })
  }, [weddingId])

  return entries
}
