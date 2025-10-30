import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  Film,
  Link2,
  Package,
  Share2,
  Volume2,
} from 'lucide-react'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Separator } from './ui/separator'

interface AssetItem {
  id: string
  label: string
  type: 'subtitle' | 'audio' | 'video'
  format: string
  size: string
  lastModified: string
  downloadUrl: string
}

interface OutputPreview {
  videoSrc: string
  videoPoster: string
  audioSrc?: string
  duration?: string
}

export interface LanguageOutput {
  code: string
  name: string
  summary: string
  assets: AssetItem[]
  preview: OutputPreview
}

export interface PublishResult {
  languageCode: string
  cdnPath: string
  expiryOption: string
  accessLevel: string
  includeDownloadBundle: boolean
  releaseNote: string
  shareUrl: string
  embedCode: string
  publishedAt: string
  qrData: string
}

interface OutputsReviewProps {
  projectName: string
  outputs: LanguageOutput[]
  onBack: () => void
  onPublishComplete: (details: PublishResult) => void
  publishResults: Record<string, PublishResult>
  initialLanguageCode?: string
  onLanguageChange?: (code: string) => void
}

export function OutputsReview({
  projectName,
  outputs,
  onBack,
  onPublishComplete,
  publishResults,
  initialLanguageCode,
  onLanguageChange,
}: OutputsReviewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (initialLanguageCode && outputs.some((output) => output.code === initialLanguageCode)) {
      return initialLanguageCode
    }
    return outputs[0]?.code ?? ''
  })
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [formState, setFormState] = useState({
    cdnPath: '',
    expiration: '30d',
    accessLevel: 'private',
    includeDownloadBundle: true,
    releaseNote: '',
  })

  const activeOutput = useMemo(
    () => outputs.find((output) => output.code === selectedLanguage),
    [outputs, selectedLanguage]
  )
  const publishResult = publishResults[selectedLanguage]

  useEffect(() => {
    if (!outputs.length) return
    if (
      initialLanguageCode &&
      outputs.some((output) => output.code === initialLanguageCode) &&
      selectedLanguage !== initialLanguageCode
    ) {
      setSelectedLanguage(initialLanguageCode)
    } else if (!selectedLanguage && outputs[0]) {
      setSelectedLanguage(outputs[0].code)
    }
  }, [outputs, initialLanguageCode, selectedLanguage])

  useEffect(() => {
    if (!outputs.length || !selectedLanguage) return
    const today = new Date()
    const timestamp = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('')
    setFormState((prev) => ({
      ...prev,
      cdnPath: `${projectName.replace(/\s+/g, '-').toLowerCase()}/${selectedLanguage}/${timestamp}`,
    }))
  }, [outputs, projectName, selectedLanguage])

  const handlePublish = () => {
    if (!activeOutput) return
    setIsPublishing(true)

    setTimeout(() => {
      const publishedAt = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })

      const shareUrl = `https://cdn.example.com/${formState.cdnPath}`
      const embedCode = `<iframe src="${shareUrl}" title="${projectName} – ${activeOutput.name}" width="640" height="360" allow="autoplay; encrypted-media" allowfullscreen></iframe>`

      const detail: PublishResult = {
        languageCode: activeOutput.code,
        cdnPath: formState.cdnPath,
        expiryOption: formState.expiration,
        accessLevel: formState.accessLevel,
        includeDownloadBundle: formState.includeDownloadBundle,
        releaseNote: formState.releaseNote.trim(),
        shareUrl,
        embedCode,
        publishedAt,
        qrData: shareUrl,
      }

      onPublishComplete(detail)
      setIsPublishing(false)
      setIsPublishDialogOpen(false)
    }, 900)
  }

  const renderSuccessCard = () => {
    if (!publishResult) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Export / Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              산출물 점검을 마쳤다면 <span className="font-semibold">Publish</span>를 눌러 배포
              설정을 완료하세요. CDN 경로와 접근 권한을 설정한 뒤 확인하면 배포 URL과 임베드 코드를
              받을 수 있습니다.
            </p>
            <Button onClick={() => setIsPublishDialogOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-green-300 bg-green-50/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            배포가 완료되었습니다
          </CardTitle>
          <p className="text-xs text-green-700/80">
            {publishResult.publishedAt} • {publishResult.cdnPath}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">배포 URL</p>
            <div className="flex items-center gap-2">
              <Input readOnly value={publishResult.shareUrl} />
              <Button variant="outline" size="icon">
                <Link2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-xs mb-1">임베드 코드</p>
            <Textarea readOnly value={publishResult.embedCode} rows={3} />
          </div>

          {publishResult.releaseNote && (
            <div>
              <p className="text-gray-500 text-xs mb-1">릴리즈 노트</p>
              <div className="rounded border border-green-200 bg-white/80 p-3">
                {publishResult.releaseNote}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="gap-2">
              <Download className="w-4 h-4" />
              번들 다운로드
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              배포 링크 열기
            </Button>
            <Button
              variant="ghost"
              className="ml-auto text-green-700 hover:text-green-800 gap-2"
              onClick={() => setIsPublishDialogOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              재배포 설정
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              파이프라인으로 돌아가기
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h2 className="text-lg font-semibold">산출물 점검 및 Publish - {projectName}</h2>
              <p className="text-xs text-gray-500">언어별 결과물 확인 후 배포 설정을 완료하세요</p>
            </div>
          </div>
          <Button
            onClick={() => setIsPublishDialogOpen(true)}
            className="gap-2"
            disabled={!activeOutput}
          >
            <Share2 className="w-4 h-4" />
            {publishResult ? '재배포' : 'Publish'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <Tabs
          value={selectedLanguage}
          onValueChange={(value) => {
            setSelectedLanguage(value)
            onLanguageChange?.(value)
          }}
        >
          <TabsList className="flex-wrap">
            {outputs.map((output) => (
              <TabsTrigger key={output.code} value={output.code}>
                {output.name}
                {publishResults[output.code] && (
                  <Badge className="ml-2 bg-green-100 text-green-700">완료</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {outputs.map((output) => (
            <TabsContent key={output.code} value={output.code} className="m-0">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-blue-500" />
                        빠른 미리보기
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        최종 합성본을 샘플 영상과 음성으로 확인하세요.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
                        <video
                          className="h-full w-full object-cover"
                          controls
                          poster={output.preview.videoPoster}
                        >
                          <source src={output.preview.videoSrc} type="video/mp4" />
                        </video>
                      </div>
                      {output.preview.audioSrc && (
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Volume2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">합성 음성 프리뷰</p>
                            <p className="text-xs text-gray-500">
                              {output.preview.duration ?? '00:30'} · 256kbps MP3
                            </p>
                          </div>
                          <audio controls className="min-w-[200px]">
                            <source src={output.preview.audioSrc} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" />
                        산출물 리스트
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        다운로드 가능한 산출물과 최신 수정 시간을 확인하세요.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>형식</TableHead>
                            <TableHead>포맷</TableHead>
                            <TableHead>용량</TableHead>
                            <TableHead>최종 수정</TableHead>
                            <TableHead className="text-right">다운로드</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {output.assets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{asset.label}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{asset.format}</Badge>
                              </TableCell>
                              <TableCell>{asset.size}</TableCell>
                              <TableCell className="text-gray-500">{asset.lastModified}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  받기
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>요약</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-600">
                      <p>{output.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">QC 통과</Badge>
                        <Badge variant="secondary">H.264 1080p</Badge>
                        <Badge variant="secondary">24fps</Badge>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>AI 교정 버전</span>
                          <span>v1.3.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span>합성 완료 시각</span>
                          <span>2025-10-26 09:40</span>
                        </div>
                        <div className="flex justify-between">
                          <span>검수 상태</span>
                          <span>{publishResults[output.code] ? '확정' : '확인 필요'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedLanguage === output.code && renderSuccessCard()}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish 설정</DialogTitle>
            <DialogDescription>
              CDN 경로와 접근 정책을 설정한 후 배포를 확정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="cdn-path">CDN 경로</Label>
              <Input
                id="cdn-path"
                value={formState.cdnPath}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    cdnPath: event.target.value,
                  }))
                }
                placeholder="project-name/language-code/20251027"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>만료 기간</Label>
                <Select
                  value={formState.expiration}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, expiration: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="만료 기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7일</SelectItem>
                    <SelectItem value="30d">30일</SelectItem>
                    <SelectItem value="90d">90일</SelectItem>
                    <SelectItem value="never">만료 없음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>접근 권한</Label>
                <Select
                  value={formState.accessLevel}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, accessLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="접근 권한" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (링크 소유자만)</SelectItem>
                    <SelectItem value="signed">Signed URL</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">다운로드 번들 생성</p>
                  <p className="text-xs text-gray-500">
                    자막/오디오/자막 프리뷰를 하나의 ZIP으로 묶어 제공합니다.
                  </p>
                </div>
                <Switch
                  checked={formState.includeDownloadBundle}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({
                      ...prev,
                      includeDownloadBundle: checked,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="release-note">릴리즈 노트 (선택)</Label>
              <Textarea
                id="release-note"
                rows={4}
                value={formState.releaseNote}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    releaseNote: event.target.value,
                  }))
                }
                placeholder="변경 사항이나 배포 메모를 입력하세요."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? '배포 중...' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
