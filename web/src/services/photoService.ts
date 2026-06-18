import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'

export async function uploadPhoto(file: File, uploaderId: string): Promise<void> {
  const compressed = await compressImage(file)
  const filename = `${crypto.randomUUID()}.jpg`
  const storageRef = ref(storage, `photos/${filename}`)
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' })
  const url = await getDownloadURL(storageRef)
  await addDoc(collection(db, 'photos'), {
    url,
    uploaderId,
    timestamp: serverTimestamp(),
  })
}

export async function deletePhoto(photoId: string, photoUrl: string): Promise<void> {
  await deleteObject(ref(storage, photoUrl))
  await deleteDoc(doc(db, 'photos', photoId))
}

async function compressImage(file: File, maxDim = 1200, quality = 0.72): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
