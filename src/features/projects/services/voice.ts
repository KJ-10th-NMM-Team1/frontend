import { getApiUrl } from '@/config'

export interface VoicePreset {
  id: string
  name: string
  gender: string
  age: string
  style: string
  language: string
}

export interface VoiceMapping {
  voiceId?: string
  preserveTone: boolean
}

export interface VoiceConfig {
  project_id: string
  voice_config: Record<string, VoiceMapping>
}

export interface CustomVoice {
  id: string
  name: string
  uploaded_at: string
}

export async function getVoicePresets(): Promise<VoicePreset[]> {
  const response = await fetch(getApiUrl('/api/voice/presets/list'))
  if (!response.ok) throw new Error('Failed to fetch voice presets')
  return response.json()
}

export async function getCustomVoices(projectId: string): Promise<CustomVoice[]> {
  const response = await fetch(getApiUrl(`/api/voice/custom/${projectId}`))
  if (!response.ok) throw new Error('Failed to fetch custom voices')
  return response.json()
}

export async function getVoiceConfig(projectId: string): Promise<VoiceConfig> {
  const response = await fetch(getApiUrl(`/api/voice/${projectId}`))
  if (!response.ok) throw new Error('Failed to fetch voice config')
  return response.json()
}

export async function updateVoiceConfig(
  projectId: string,
  voiceConfig: Record<string, VoiceMapping>
): Promise<VoiceConfig> {
  const response = await fetch(getApiUrl(`/api/voice/${projectId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_config: voiceConfig }),
  })
  if (!response.ok) throw new Error('Failed to update voice config')
  return response.json()
}

export async function uploadVoiceFile(file: File, projectId: string): Promise<string> {
  // 1. prepare-upload로 presigned URL 받기
  const prepareResponse = await fetch(getApiUrl('/api/voice/prepare-upload'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      filename: file.name,
      content_type: file.type,
    }),
  })
  if (!prepareResponse.ok) throw new Error('Failed to prepare upload')
  const { upload_url, fields, object_key } = await prepareResponse.json()

  // 2. S3에 직접 업로드
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value as string)
  })
  formData.append('file', file)

  const uploadResponse = await fetch(upload_url, {
    method: 'POST',
    body: formData,
  })
  if (!uploadResponse.ok) throw new Error('Failed to upload to S3')

  // 3. finish-upload로 완료 확인
  const finishResponse = await fetch(getApiUrl('/api/voice/finish-upload'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ object_key }),
  })
  if (!finishResponse.ok) throw new Error('Failed to finish upload')
  const { voice_id } = await finishResponse.json()

  return voice_id
}
