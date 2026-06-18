import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function addVideoLink(url: string, uploaderId: string, weddingId: string): Promise<void> {
  await addDoc(collection(db, 'weddings', weddingId, 'videos'), {
    url,
    uploaderId,
    timestamp: serverTimestamp(),
    filename: extractTitle(url),
  })
}

export async function deleteVideo(videoId: string, _videoUrl: string, weddingId: string): Promise<void> {
  await deleteDoc(doc(db, 'weddings', weddingId, 'videos', videoId))
}

function extractTitle(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace('www.', '') + u.pathname.slice(0, 30)
  } catch {
    return url.slice(0, 40)
  }
}

export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    }
    if (u.hostname.includes('vimeo.com')) {
      const videoId = u.pathname.slice(1)
      if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    if (u.hostname.includes('drive.google.com')) {
      const fileId = u.pathname.match(/\/d\/([^/]+)/)?.[1]
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
    }
    return null
  } catch {
    return null
  }
}
