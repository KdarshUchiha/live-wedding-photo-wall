import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { RsvpEntry } from '../types'

export function useRsvp(weddingId: string) {
  const [entries, setEntries] = useState<RsvpEntry[]>([])

  useEffect(() => {
    if (!weddingId) return
    const q = query(collection(db, 'weddings', weddingId, 'rsvp'), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<RsvpEntry, 'id'>) })))
    })
  }, [weddingId])

  return entries
}
