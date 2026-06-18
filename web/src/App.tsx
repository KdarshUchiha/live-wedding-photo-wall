import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import WeddingDetailPage from './pages/WeddingDetailPage'
import AlbumsPage from './pages/AlbumsPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'
import VideoGalleryPage from './pages/VideoGalleryPage'
import InvitePage from './pages/InvitePage'
import GuestbookPage from './pages/GuestbookPage'
import type { Page } from './types'

export default function App() {
  const user = useAuth()
  const [page, setPage] = useState<Page>({ name: 'home' })

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontFamily: '"Great Vibes", cursive', color: '#8B1A1A', fontSize: '3rem' }}>Wedding Wall</p>
        <p style={{ fontFamily: '"Playfair Display", serif', color: '#aaa', fontSize: '0.9rem' }}>Loading your experience…</p>
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
        onAlbums={() => setPage({ name: 'albums', wedding: page.wedding })}
        onVideos={() => setPage({ name: 'videos', wedding: page.wedding })}
        onInvite={() => setPage({ name: 'invite', wedding: page.wedding })}
        onGuestbook={() => setPage({ name: 'guestbook', wedding: page.wedding })}
        onTimeline={() => setPage({ name: 'timeline', wedding: page.wedding })}
      />
    )
  }

  if (page.name === 'albums') {
    return (
      <AlbumsPage
        wedding={page.wedding}
        user={user}
        onOpen={(album) => setPage({ name: 'photos', wedding: page.wedding, album })}
        onBack={() => setPage({ name: 'detail', wedding: page.wedding })}
      />
    )
  }

  if (page.name === 'photos') {
    return (
      <PhotoGalleryPage
        wedding={page.wedding}
        album={page.album}
        user={user}
        isAdmin={user.uid === page.wedding.createdBy}
        onBack={() => setPage({ name: 'albums', wedding: page.wedding })}
      />
    )
  }

  if (page.name === 'videos') {
    return (
      <VideoGalleryPage
        wedding={page.wedding}
        user={user}
        isAdmin={user.uid === page.wedding.createdBy}
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

  if (page.name === 'guestbook') {
    return (
      <GuestbookPage
        wedding={page.wedding}
        user={user}
        onBack={() => setPage({ name: 'detail', wedding: page.wedding })}
      />
    )
  }

  // timeline page — inline for now
  if (page.name === 'timeline') {
    const w = page.wedding
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f5', paddingBottom: 40 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px', background: 'white', borderBottom: '1px solid #f0ece6', position: 'sticky', top: 0, zIndex: 30 }}>
          <button style={{ width: 38, height: 38, borderRadius: '50%', background: '#f5f1ec', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            onClick={() => setPage({ name: 'detail', wedding: w })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h1 style={{ fontFamily: '"Great Vibes", cursive', fontSize: '2rem', color: '#8B1A1A', lineHeight: 1 }}>Day Timeline</h1>
            <p style={{ fontSize: '0.78rem', color: '#aaa', fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>{w.bride} &amp; {w.groom}</p>
          </div>
        </header>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
          {(!w.timeline || w.timeline.length === 0) ? (
            <p style={{ textAlign: 'center', color: '#bbb', fontStyle: 'italic', fontFamily: '"Playfair Display", serif', paddingTop: 60 }}>
              No timeline added yet. The couple can add it when editing the wedding.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {w.timeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#8B1A1A', marginTop: 4, flexShrink: 0, zIndex: 1 }} />
                    {i < w.timeline.length - 1 && <div style={{ width: 2, flex: 1, background: '#f0ece6', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: 28 }}>
                    <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.75rem', color: '#8B1A1A', fontWeight: 600, letterSpacing: '0.08em' }}>{event.time}</div>
                    <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', marginTop: 2 }}>{event.title}</div>
                    {event.description && <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 2, lineHeight: 1.5 }}>{event.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
