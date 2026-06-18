import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { Wedding } from '../types'

export function useWeddings() {
  const [weddings, setWeddings] = useState<Wedding[]>([])

  useEffect(() => {
    const q = query(collection(db, 'weddings'), orderBy('date', 'asc'))
    return onSnapshot(q, (snap) => {
      setWeddings(
        snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Wedding, 'id'>) }))
      )
    })
  }, [])

  return weddings
}
