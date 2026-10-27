import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import type { Wedding } from '../types'

/** Live copy of one wedding, so plan upgrades and the photo counter show up without a reload. */
export function useWedding(initial: Wedding): Wedding {
  const [wedding, setWedding] = useState<Wedding>(initial)

  useEffect(() => {
    return onSnapshot(doc(db, 'weddings', initial.id), (snap) => {
      if (snap.exists()) setWedding({ id: snap.id, ...(snap.data() as Omit<Wedding, 'id'>) })
    })
  }, [initial.id])

  return wedding
}
