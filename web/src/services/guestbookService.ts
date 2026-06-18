import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function addGuestbookEntry(
  weddingId: string,
  guestName: string,
  message: string,
  uploaderId: string
): Promise<void> {
  await addDoc(collection(db, 'weddings', weddingId, 'guestbook'), {
    guestName, message, uploaderId, timestamp: serverTimestamp(),
  })
}

export async function deleteGuestbookEntry(weddingId: string, entryId: string): Promise<void> {
  await deleteDoc(doc(db, 'weddings', weddingId, 'guestbook', entryId))
}
