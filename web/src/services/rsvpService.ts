import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function submitRsvp(
  weddingId: string,
  uploaderId: string,
  data: { name: string; attending: 'yes' | 'no' | 'maybe'; guestCount: number; mealPreference: string; message: string }
): Promise<void> {
  await addDoc(collection(db, 'weddings', weddingId, 'rsvp'), {
    ...data, uploaderId, timestamp: serverTimestamp(),
  })
}
