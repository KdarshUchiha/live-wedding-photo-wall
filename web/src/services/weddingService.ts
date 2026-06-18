import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
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
