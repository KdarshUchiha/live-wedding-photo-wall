import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Album } from '../types'

export async function createAlbum(
  weddingId: string,
  data: Omit<Album, 'id' | 'createdAt' | 'photoCount'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'weddings', weddingId, 'albums'), {
    ...data,
    photoCount: 0,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteAlbum(weddingId: string, albumId: string): Promise<void> {
  await deleteDoc(doc(db, 'weddings', weddingId, 'albums', albumId))
}

// Simple SHA-256 pin hash using Web Crypto
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === storedHash
}
