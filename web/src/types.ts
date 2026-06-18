export type ReligiousTheme =
  | 'christian'
  | 'hindu'
  | 'muslim'
  | 'jewish'
  | 'sikh'
  | 'buddhist'
  | 'civil'
  | 'other'

export interface TimelineEvent {
  time: string   // "14:00"
  title: string
  description?: string
}

export interface Wedding {
  id: string
  bride: string
  groom: string
  date: string
  time: string
  venue: string
  location: string
  themeColor: string
  religiousTheme: ReligiousTheme
  timeline: TimelineEvent[]
  musicUrl?: string
  createdAt: number
  createdBy: string
}

export interface Album {
  id: string
  name: string
  emoji: string
  description: string
  isPrivate: boolean   // PIN-protected
  pinHash: string      // SHA-256 of the PIN (empty if public)
  createdBy: string
  createdAt: number
  photoCount: number
}

export interface Photo {
  id: string
  url: string
  uploaderId: string
  timestamp: number
  albumId: string
}

export interface Video {
  id: string
  url: string
  uploaderId: string
  timestamp: number
  filename: string
}

export interface GuestbookEntry {
  id: string
  guestName: string
  message: string
  uploaderId: string
  timestamp: number
}

export interface RsvpEntry {
  id: string
  name: string
  attending: 'yes' | 'no' | 'maybe'
  guestCount: number
  mealPreference: string
  message: string
  uploaderId: string
  timestamp: number
}

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done' }
  | { status: 'failed'; message: string }

export type Page =
  | { name: 'home' }
  | { name: 'detail'; wedding: Wedding }
  | { name: 'albums'; wedding: Wedding }
  | { name: 'photos'; wedding: Wedding; album: Album }
  | { name: 'videos'; wedding: Wedding }
  | { name: 'invite'; wedding: Wedding }
  | { name: 'guestbook'; wedding: Wedding }
  | { name: 'timeline'; wedding: Wedding }
