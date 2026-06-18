export interface Wedding {
  id: string
  bride: string
  groom: string
  date: string
  time: string
  venue: string
  location: string
  themeColor: string
  createdAt: number
  createdBy: string
}

export interface Photo {
  id: string
  url: string
  uploaderId: string
  timestamp: number
}

export interface Video {
  id: string
  url: string
  uploaderId: string
  timestamp: number
  filename: string
}

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done' }
  | { status: 'failed'; message: string }

export type Page =
  | { name: 'home' }
  | { name: 'detail'; wedding: Wedding }
  | { name: 'photos'; wedding: Wedding }
  | { name: 'videos'; wedding: Wedding }
  | { name: 'invite'; wedding: Wedding }
