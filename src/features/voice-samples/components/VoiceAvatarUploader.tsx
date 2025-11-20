import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { Label } from '@/shared/ui/Label'

export function VoiceAvatarUploader({
  avatarPreview,
  onFileChange,
  disabled,
  helperText,
}: {
  avatarPreview: string | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
  helperText?: string
}) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isPresetLoading, setIsPresetLoading] = useState(false)
  const uploadFallback =
    'https://placehold.co/160x160/png?text=Avatar' /* open placeholder for custom upload */

  const presetAvatars = [
    { id: 'default', src: '/avatars/default-avatar.png', label: '기본 1' },
    { id: 'male', src: '/avatars/default-avatar-male.png', label: '기본 2' },
    { id: 'female', src: '/avatars/default-avatar-female.png', label: '기본 3' },
  ]

  const handlePresetSelect = async (presetId: string, src: string) => {
    if (disabled) return
    setIsPresetLoading(true)
    setSelectedPreset(presetId)
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const file = new File([blob], `${presetId}-avatar.png`, { type: blob.type || 'image/png' })
      onFileChange(file)
    } catch (error) {
      console.error('Failed to load preset avatar', error)
      setSelectedPreset(null)
    } finally {
      setIsPresetLoading(false)
    }
  }

  const handleUploadClick = () => {
    if (disabled) return
    setSelectedPreset(null)
    document.getElementById('avatar-upload')?.click()
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedPreset(null)
    onFileChange(file)
  }

  return (
    <div className="space-y-2 rounded-xl border border-surface-3 bg-surface-1 p-4">
      <Label>아바타 이미지</Label>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {presetAvatars.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id, preset.src)}
              disabled={disabled || isPresetLoading}
              className={`rounded-full border p-1 transition ${
                selectedPreset === preset.id ? 'border-primary ring-2 ring-primary/60' : 'border-surface-4 hover:border-primary'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <div className="h-16 w-16 overflow-hidden rounded-full">
                <img src={preset.src} alt={preset.label} className="h-full w-full object-cover" />
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={disabled}
            className="rounded-full border border-dashed border-surface-4 p-1 transition hover:border-primary disabled:opacity-50"
          >
            <div className="h-16 w-16 overflow-hidden rounded-full">
              <img
                src={avatarPreview ?? uploadFallback}
                alt="voice avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1 text-xs text-muted">
          <p>기본 아바타를 선택하거나 직접 원하는 이미지를 업로드할 수 있어요.</p>
          <p>{helperText}</p>
        </div>
      </div>
    </div>
  )
}
