export interface Photo {
  id: string
  url: string
  uploaderId: string
  timestamp: number
}

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done' }
  | { status: 'failed'; message: string }
