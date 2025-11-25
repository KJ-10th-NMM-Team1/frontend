import { useState, useEffect, useRef } from 'react'

import { Check, Upload, X } from 'lucide-react'

import { Label } from '@/shared/ui/Label'
import { Button } from '@/shared/ui/Button'

export function VoiceAvatarUploader({
  avatarPreview,
  selectedPreset: selectedPresetProp,
  onPresetChange,
  onImageFileChange,
  disabled,
  helperText,
}: {
  avatarPreview: string | null
  selectedPreset?: string | null
  onPresetChange: (presetId: string | null) => void
  onImageFileChange?: (file: File | null) => void
  disabled?: boolean
  helperText?: string
}) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(selectedPresetProp ?? null)
  const [isPresetLoading, setIsPresetLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const presetAvatars = [
    { id: 'default', src: '/avatars/default-avatar.png', label: '기본 1' },
    { id: 'male', src: '/avatars/default-avatar-male.png', label: '기본 2' },
    { id: 'female', src: '/avatars/default-avatar-female.png', label: '기본 3' },
  ]

  const handlePresetSelect = (presetId: string) => {
    if (disabled) return
    setIsPresetLoading(true)
    setSelectedPreset(presetId)
    // 프리셋 선택 시 이미지 파일 초기화
    setImageFile(null)
    setImagePreview(null)
    onPresetChange(presetId)
    onImageFileChange?.(null)
    setIsPresetLoading(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setImageFile(file)
    setSelectedPreset(null)
    onPresetChange(null)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onImageFileChange?.(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageFileChange?.(null)
  }

  useEffect(() => {
    setSelectedPreset(selectedPresetProp ?? null)
  }, [selectedPresetProp])

  const hasCustomImage = imageFile || imagePreview
  const displayPreview = imagePreview || (hasCustomImage ? null : avatarPreview)

  return (
    <div className="space-y-2">
      <Label className="font-semibold text-foreground">아바타 이미지</Label>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {presetAvatars.map((preset) => {
            const isSelected = selectedPreset === preset.id && !hasCustomImage
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  handlePresetSelect(preset.id)
                }}
                disabled={disabled || isPresetLoading}
                className={`relative rounded-full border p-1 transition ${
                  isSelected ? 'border-primary ring-2 ring-primary/60' : 'border-surface-4 hover:border-primary'
                } ${disabled ? 'opacity-50' : ''} ${hasCustomImage ? 'opacity-50' : ''}`}
              >
                <div className="h-16 w-16 overflow-hidden rounded-full">
                  <img src={preset.src} alt={preset.label} className="h-full w-full object-cover" />
                </div>
                {isSelected && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}

          {/* 커스텀 이미지 업로드 버튼 */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
              id="avatar-image-upload"
            />
            <label
              htmlFor="avatar-image-upload"
              className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition ${
                hasCustomImage
                  ? 'border-primary ring-2 ring-primary/60'
                  : 'border-surface-4 hover:border-primary'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {hasCustomImage ? (
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <img
                    src={displayPreview || undefined}
                    alt="업로드된 이미지"
                    className="h-full w-full object-cover"
                  />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage()
                      }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </label>
            {hasCustomImage && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasCustomImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-8 text-xs"
            >
              <Upload className="mr-1.5 h-3 w-3" />
              이미지 업로드
            </Button>
          )}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>{helperText || '기본 아바타 중 하나를 선택하거나 직접 이미지를 업로드하세요.'}</p>
          <p>아바타는 목소리 카드에 노출되며, 선택하지 않으면 기본 이미지가 사용됩니다.</p>
          {hasCustomImage && (
            <p className="text-primary">커스텀 이미지가 선택되었습니다. (512x512 이하 PNG/JPG 권장)</p>
          )}
        </div>
      </div>
    </div>
  )
}
