export type SourceSelectionResult = {
  mode: 'youtube' | 'file'
  youtubeUrl?: string
  file?: File
}

export type ProjectCreationDraft = {
  sourceType: 'youtube' | 'file'
  youtubeUrl?: string
  file?: File
  fileName?: string
  fileSize?: number
  title: string
  detectAutomatically: boolean
  sourceLanguage: string
  targetLanguages: string[]
  speakerCount: number
}

export type UploadStage =
  | 'idle'
  | 'preparing'
  | 'uploading'
  | 'finalizing'
  | 'processing'
  | 'downloading'
  | 'done'
  | 'error'

export type UploadProgressState = {
  stage: UploadStage
  progress: number
  message?: string
}
