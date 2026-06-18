import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import WeddingDetailPage from './pages/WeddingDetailPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'
import VideoGalleryPage from './pages/VideoGalleryPage'
import InvitePage from './pages/InvitePage'
import type { Page } from './types'

export default function App() {
  const user = useAuth()
  const [page, setPage] = useState<Page>({ name: 'home' })

  if (!user) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <p style={{ fontFamily:'Playfair Display, serif', color:'#8B1A1A', fontSize:'1.2rem' }}>
          Loading…
        </p>
      </div>
    )
  }

  if (page.name === 'home') {
    return <HomePage user={user} onOpen={(w) => setPage({ name: 'detail', wedding: w })} />
  }
  if (page.name === 'detail') {
    return (
      <WeddingDetailPage
        wedding={page.wedding}
        user={user}
        onBack={() => setPage({ name: 'home' })}
        onPhotos={() => setPage({ name: 'photos', wedding: page.wedding })}
        onVideos={() => setPage({ name: 'videos', wedding: page.wedding })}
        onInvite={() => setPage({ name: 'invite', wedding: page.wedding })}
      />
    )
  }
  if (page.name === 'photos') {
    return (
      <PhotoGalleryPage
        wedding={page.wedding}
        user={user}
        onBack={() => setPage({ name: 'detail', wedding: page.wedding })}
      />
    )
  }
  if (page.name === 'videos') {
    return (
      <VideoGalleryPage
        wedding={page.wedding}
        user={user}
        onBack={() => setPage({ name: 'detail', wedding: page.wedding })}
      />
    )
  }
  if (page.name === 'invite') {
    return (
      <InvitePage
        wedding={page.wedding}
        onBack={() => setPage({ name: 'detail', wedding: page.wedding })}
      />
    )
  }

  return null
}
