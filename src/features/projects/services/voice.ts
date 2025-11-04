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

export async function getVoicePresets(): Promise<VoicePreset[]> {
  const response = await fetch(getApiUrl('/api/voice/presets/list'))
  if (!response.ok) throw new Error('Failed to fetch voice presets')
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
