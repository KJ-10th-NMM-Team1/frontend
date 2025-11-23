/**
 * 에디터 버전 관리 섹션
 * Zustand store를 통해 언어별 버전 스냅샷을 관리
 */

import { Clock, GitBranch } from 'lucide-react'

import type { Segment } from '@/entities/segment/types'
import type { TrackRow } from '@/features/editor/components/audio-track/types'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'
import { useVersionStore } from '@/shared/store/useVersionStore'

type VersionListSectionProps = {
  projectId: string
  languageCode: string
}

// 트랙 색상 팔레트
const TRACK_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function VersionListSection({ projectId, languageCode }: VersionListSectionProps) {
  const setCurrentVersion = useVersionStore((state) => state.setCurrentVersion)
  const setTracks = useTracksStore((state) => state.setTracks)
  const setPlaying = useEditorStore((state) => state.setPlaying)
  const setPlayhead = useEditorStore((state) => state.setPlayhead)

  // Reactively subscribe to versions and currentVersionId
  const versionKey = `${projectId}:${languageCode}`
  const versions = useVersionStore((state) => state.versionsByLanguage[versionKey] || [])
  const currentVersionId = useVersionStore(
    (state) => state.currentVersionIdByLanguage[versionKey] || null,
  )

  // 버전 복원: segments를 tracks로 변환하여 적용
  const restoreVersion = (versionId: string, segments: Segment[]) => {
    // 재생 정지 및 플레이헤드 초기화
    setPlaying(false)
    setPlayhead(0)
    // segments를 speaker_tag별로 그룹화
    const segmentsByTag = segments.reduce(
      (acc, segment) => {
        const tag = segment.speaker_tag || 'Unknown'
        if (!acc[tag]) {
          acc[tag] = []
        }
        acc[tag].push(segment)
        return acc
      },
      {} as Record<string, Segment[]>,
    )

    // 각 speaker_tag 그룹을 TrackRow로 변환
    const tracks: TrackRow[] = Object.entries(segmentsByTag).map(([tag, segs], index) => ({
      id: `speaker-${tag}-${Date.now()}`,
      type: 'speaker' as const,
      label: tag,
      color: TRACK_COLORS[index % TRACK_COLORS.length],
      segments: segs.sort((a, b) => a.start - b.start),
      size: 'medium' as const,
      voiceSampleId: 'clone',
    }))

    // tracks 상태 업데이트
    setTracks(tracks)

    // 현재 버전 설정
    setCurrentVersion(projectId, languageCode, versionId)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 1000 / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="flex h-full flex-col rounded border border-surface-3 bg-white p-3">
      <div className="mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">버전 관리</h3>
        </div>
        {versions.length > 0 && (
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
            {versions.length}
          </span>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <div className="rounded-full bg-surface-2 p-3">
            <GitBranch className="h-5 w-5 text-muted" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">버전이 없습니다</p>
            <p className="text-xs text-muted">작업 내용을 저장하면 버전이 생성됩니다</p>
          </div>
        </div>
      ) : (
        <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-1">
          {versions.map((version) => {
            const isLatest = version.id === versions[versions.length - 1]?.id
            const isCurrent = version.id === currentVersionId
            const versionNumber = version.name.split('-')[1] || '0'

            return (
              <div
                key={version.id}
                onClick={() => restoreVersion(version.id, version.segments)}
                className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
                  isCurrent
                    ? 'border-primary/60 bg-primary/5 shadow-sm'
                    : 'border-surface-3 bg-white hover:border-primary/30 hover:shadow-sm'
                }`}
                role="button"
                tabIndex={0}
              >
                {/* 왼쪽 액센트 바 */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 transition-all ${
                    isCurrent ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'
                  }`}
                />

                <div className="flex items-center gap-3 px-3 py-2.5 pl-4">
                  {/* 버전 번호 배지 */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold transition-all ${
                      isCurrent
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-2 text-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}
                  >
                    v{versionNumber}
                  </div>

                  {/* 버전 정보 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate font-semibold ${
                          isCurrent ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {version.name}
                      </span>
                      {isLatest && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          최신
                        </span>
                      )}
                    </div>

                    {/* 시간 정보 */}
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(version.createdAt)}</span>
                    </div>
                  </div>

                  {/* 현재 버전 표시 */}
                  {isCurrent && (
                    <div className="shrink-0">
                      <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        현재
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
