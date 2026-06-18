import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'

export async function uploadPhoto(file: File, uploaderId: string, weddingId: string): Promise<void> {
  const compressed = await compressImage(file)
  const filename = `${crypto.randomUUID()}.jpg`
  const storageRef = ref(storage, `weddings/${weddingId}/photos/${filename}`)
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' })
  const url = await getDownloadURL(storageRef)
  await addDoc(collection(db, 'weddings', weddingId, 'photos'), {
    url,
    uploaderId,
    timestamp: serverTimestamp(),
  })
}

export async function deletePhoto(photoId: string, photoUrl: string, weddingId: string): Promise<void> {
  await deleteObject(ref(storage, photoUrl))
  await deleteDoc(doc(db, 'weddings', weddingId, 'photos', photoId))
}

async function compressImage(file: File, maxDim = 1200, quality = 0.72): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('Compression failed')) },
        'image/jpeg', quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
