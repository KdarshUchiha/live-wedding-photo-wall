import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'

export async function uploadVideo(file: File, uploaderId: string, weddingId: string): Promise<void> {
  const filename = `${crypto.randomUUID()}_${file.name}`
  const storageRef = ref(storage, `weddings/${weddingId}/videos/${filename}`)
  await uploadBytes(storageRef, file, { contentType: file.type })
  const url = await getDownloadURL(storageRef)
  await addDoc(collection(db, 'weddings', weddingId, 'videos'), {
    url,
    uploaderId,
    timestamp: serverTimestamp(),
    filename: file.name,
  })
}

export async function deleteVideo(videoId: string, videoUrl: string, weddingId: string): Promise<void> {
  await deleteObject(ref(storage, videoUrl))
  await deleteDoc(doc(db, 'weddings', weddingId, 'videos', videoId))
}
