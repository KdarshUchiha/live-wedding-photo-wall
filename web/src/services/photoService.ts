import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function uploadPhoto(file: File, uploaderId: string, weddingId: string, albumId: string): Promise<void> {
  const dataUrl = await compressToDataUrl(file)
  await addDoc(collection(db, 'weddings', weddingId, 'photos'), {
    url: dataUrl,
    uploaderId,
    albumId,
    timestamp: serverTimestamp(),
  })
}

export async function deletePhoto(photoId: string, _photoUrl: string, weddingId: string): Promise<void> {
  await deleteDoc(doc(db, 'weddings', weddingId, 'photos', photoId))
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
