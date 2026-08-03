import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { Wedding } from '../types'

export async function createWedding(
  data: Omit<Wedding, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'weddings'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteWedding(weddingId: string): Promise<void> {
  await deleteDoc(doc(db, 'weddings', weddingId))
}

/**
 * Fetch a single wedding by id. Used for QR / deep-link landings where a guest
 * opens `?w=<id>` directly and we need the event before the full list loads.
 * Returns null if the wedding does not exist.
 */
export async function getWedding(weddingId: string): Promise<Wedding | null> {
  const snap = await getDoc(doc(db, 'weddings', weddingId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<Wedding, 'id'>) }
}
