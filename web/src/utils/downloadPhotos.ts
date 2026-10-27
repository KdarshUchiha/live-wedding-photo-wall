import JSZip from 'jszip'

interface DownloadOptions {
  albumName?: string
  onProgress?: (fraction: number) => void
  watermark?: boolean
  watermarkText?: string
}

// Bundles every photo into ONE .zip instead of firing N browser downloads.
// Photos are base64 data URLs stored in Firestore, so they decode straight into the archive.
export async function downloadAllPhotos(
  photos: { url: string; id: string }[],
  { albumName = 'wedding-photos', onProgress, watermark = false, watermarkText = 'Live Wedding Photo Wall' }: DownloadOptions = {},
) {
  const zip = new JSZip()
  const folder = slugify(albumName)

  for (let i = 0; i < photos.length; i++) {
    const blob = watermark
      ? await applyWatermark(photos[i].url, watermarkText)
      : await (await fetch(photos[i].url)).blob()
    zip.file(`${folder}/photo_${String(i + 1).padStart(3, '0')}.jpg`, blob)
    onProgress?.(((i + 1) / photos.length) * 0.8)
  }

  const archive = await zip.generateAsync({ type: 'blob' }, (meta) => {
    onProgress?.(0.8 + (meta.percent / 100) * 0.2)
  })

  const url = URL.createObjectURL(archive)
  const a = document.createElement('a')
  a.href = url
  a.download = `${folder}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  onProgress?.(1)
}

async function applyWatermark(src: string, text: string): Promise<Blob> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const fontSize = Math.max(14, Math.round(img.width * 0.028))
  const pad = Math.round(fontSize * 0.8)
  ctx.font = `600 ${fontSize}px 'Playfair Display', serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = fontSize / 3
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(text, img.width - pad, img.height - pad)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Watermark failed'))), 'image/jpeg', 0.9))
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'wedding-photos'
}
