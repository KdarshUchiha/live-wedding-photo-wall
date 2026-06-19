export async function downloadAllPhotos(photos: { url: string; id: string }[]) {
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]
    const response = await fetch(photo.url)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `photo_${i + 1}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    // Small delay to avoid browser blocking multiple downloads
    if (i < photos.length - 1) await new Promise(r => setTimeout(r, 300))
  }
}
