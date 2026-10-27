import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { forgetJoinedWedding, getJoinedWeddingIds } from '../utils/joinedWeddings'
import type { Wedding } from '../types'

/** Weddings this user created plus the ones they joined via QR / link — never everyone's. */
export function useWeddings(uid: string) {
  const [owned, setOwned] = useState<Wedding[]>([])
  const [joined, setJoined] = useState<Record<string, Wedding>>({})

  useEffect(() => {
    // Sorted client-side to avoid needing a composite (createdBy, date) index.
    const q = query(collection(db, 'weddings'), where('createdBy', '==', uid))
    return onSnapshot(q, (snap) => {
      setOwned(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Wedding, 'id'>) })))
    })
  }, [uid])

  useEffect(() => {
    const unsubs = getJoinedWeddingIds().map((id) =>
      onSnapshot(doc(db, 'weddings', id), (snap) => {
        if (snap.exists()) {
          setJoined((prev) => ({ ...prev, [id]: { id, ...(snap.data() as Omit<Wedding, 'id'>) } }))
        } else {
          forgetJoinedWedding(id)
          setJoined(({ [id]: _gone, ...rest }) => rest)
        }
      }, () => forgetJoinedWedding(id)),
    )
    return () => unsubs.forEach((u) => u())
  }, [])

  const byId = new Map<string, Wedding>()
  for (const w of [...Object.values(joined), ...owned]) byId.set(w.id, w)
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date))
}
