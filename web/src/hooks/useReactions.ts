import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export type ReactionType = '❤️' | '🥂' | '😍' | '🥹'
export const REACTIONS: ReactionType[] = ['❤️', '🥂', '😍', '🥹']

interface ReactionCounts {
  [emoji: string]: number
}

export function useReactions(weddingId: string, photoId: string, userId: string) {
  const [counts, setCounts] = useState<ReactionCounts>({})
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null)

  useEffect(() => {
    if (!weddingId || !photoId) return
    const col = collection(db, 'weddings', weddingId, 'photos', photoId, 'reactions')
    return onSnapshot(col, (snap) => {
      const c: ReactionCounts = {}
      let mine: ReactionType | null = null
      snap.docs.forEach((d) => {
        const emoji = d.data().emoji as ReactionType
        c[emoji] = (c[emoji] || 0) + 1
        if (d.id === userId) mine = emoji
      })
      setCounts(c)
      setMyReaction(mine)
    })
  }, [weddingId, photoId, userId])

  const toggle = async (emoji: ReactionType) => {
    const ref = doc(db, 'weddings', weddingId, 'photos', photoId, 'reactions', userId)
    if (myReaction === emoji) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, { emoji })
    }
  }

  return { counts, myReaction, toggle }
}
