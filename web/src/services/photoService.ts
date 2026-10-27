import { Timestamp, collection, doc, increment, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { PLANS } from '../config/plans'

// Free-tier photos expire a day short of the advertised retention so a skewed client clock
// still lands inside the window firestore.rules accepts (28–30 days from server time).
const FREE_EXPIRY_MS = ((PLANS.free.retentionDays ?? 30) - 1) * 24 * 60 * 60 * 1000

export async function uploadPhoto(file: File, uploaderId: string, weddingId: string, albumId: string, isPro: boolean): Promise<void> {
  const dataUrl = await compressToDataUrl(file)
  const photoRef = doc(collection(db, 'weddings', weddingId, 'photos'))
  // Photo + counter bump commit atomically; firestore.rules rejects one without the other.
  const batch = writeBatch(db)
  batch.set(photoRef, {
    url: dataUrl,
    uploaderId,
    albumId,
    timestamp: serverTimestamp(),
    ...(isPro ? {} : { expireAt: Timestamp.fromMillis(Date.now() + FREE_EXPIRY_MS) }),
  })
  batch.update(doc(db, 'weddings', weddingId), { photoCount: increment(1), lastPhotoId: photoRef.id })
  await batch.commit()
}

export async function deletePhoto(photoId: string, weddingId: string, currentCount: number): Promise<void> {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'weddings', weddingId, 'photos', photoId))
  // Legacy events have no counter yet (0) — nothing to decrement.
  if (currentCount > 0)
    batch.update(doc(db, 'weddings', weddingId), { photoCount: increment(-1), lastPhotoId: photoId })
  await batch.commit()
}

async function compressToDataUrl(file: File, maxDim = 1200, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
