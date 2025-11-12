export type AssetType = 'preview_video' | 'subtitle_srt' | 'dubbed_audio' // | 'dubbed_video'

export interface AssetEntry {
  project_id: string
  language_code: string
  asset_type: AssetType
  file_path: string
  created_at: string
  asset_id: string
}
