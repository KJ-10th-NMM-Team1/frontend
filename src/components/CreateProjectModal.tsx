import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { Upload, X } from 'lucide-react'

interface Language {
  code: string
  name: string
  subtitle: boolean
  dubbing: boolean
}

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject: (project: {
    name: string
    languages: Language[]
    uploadProgress: number
  }) => void
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onCreateProject,
}: CreateProjectModalProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<string>('')
  const [subtitle, setSubtitle] = useState(true)
  const [dubbing, setDubbing] = useState(true)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const availableLanguages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ]

  const handleAddLanguage = () => {
    if (currentLanguage && !selectedLanguages.find((l) => l.code === currentLanguage)) {
      const lang = availableLanguages.find((l) => l.code === currentLanguage)
      if (lang) {
        setSelectedLanguages([
          ...selectedLanguages,
          {
            ...lang,
            subtitle,
            dubbing,
          },
        ])
        setCurrentLanguage('')
      }
    }
  }

  const handleRemoveLanguage = (code: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l.code !== code))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleCreate = () => {
    if (!videoFile || selectedLanguages.length === 0) return

    setIsUploading(true)

    // 업로드 진행률 시뮬레이션
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onCreateProject({
              name: videoFile.name,
              languages: selectedLanguages,
              uploadProgress: 100,
            })
            handleReset()
            onOpenChange(false)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleReset = () => {
    setSelectedLanguages([])
    setCurrentLanguage('')
    setVideoFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setSubtitle(true)
    setDubbing(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 프로젝트 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 비디오 업로드 */}
          <div className="space-y-2">
            <Label>영상 업로드</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {!videoFile ? (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    클릭하여 영상 파일을 선택하거나 드래그 앤 드롭
                  </p>
                  <p className="text-xs text-gray-400 mt-2">MP4, MOV, AVI 등</p>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{videoFile.name}</span>
                    {!isUploading && (
                      <Button variant="ghost" size="sm" onClick={() => setVideoFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-gray-500">{uploadProgress}% 업로드 중...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 타겟 언어 선택 */}
          <div className="space-y-3">
            <Label>타겟 언어 설정</Label>

            <div className="flex gap-3">
              <div className="flex-1">
                <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="언어 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="subtitle"
                    checked={subtitle}
                    onCheckedChange={(checked) => setSubtitle(checked as boolean)}
                  />
                  <Label htmlFor="subtitle" className="cursor-pointer">
                    자막
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dubbing"
                    checked={dubbing}
                    onCheckedChange={(checked) => setDubbing(checked as boolean)}
                  />
                  <Label htmlFor="dubbing" className="cursor-pointer">
                    더빙
                  </Label>
                </div>
              </div>

              <Button onClick={handleAddLanguage} disabled={!currentLanguage}>
                추가
              </Button>
            </div>

            {/* 선택된 언어 목록 */}
            {selectedLanguages.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-xs text-gray-500">선택된 언어</Label>
                <div className="space-y-2">
                  {selectedLanguages.map((lang) => (
                    <div
                      key={lang.code}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span>{lang.name}</span>
                        <div className="flex gap-2 text-xs text-gray-600">
                          {lang.subtitle && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              자막
                            </span>
                          )}
                          {lang.dubbing && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              더빙
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLanguage(lang.code)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                handleReset()
                onOpenChange(false)
              }}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!videoFile || selectedLanguages.length === 0 || isUploading}
            >
              {isUploading ? '생성 중...' : '프로젝트 생성'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
