/**
 * 더빙 이슈 표시 섹션
 */

import { useMemo } from 'react'

import type { Issue } from '@/entities/issue/types'
import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'
import { useTracksStore } from '@/shared/store/useTracksStore'

type IssueWithSegment = Issue & {
  segmentId: string
  segmentStart: number
}

type DubbingIssuesSectionProps = {
  segments: Segment[]
}

export function DubbingIssuesSection({ segments }: DubbingIssuesSectionProps) {
  const setPlayhead = useEditorStore((state) => state.setPlayhead)
  const setPlaying = useEditorStore((state) => state.setPlaying)
  const { getAllSegments } = useTracksStore((state) => ({
    getAllSegments: state.getAllSegments,
  }))
  const storeSegments = getAllSegments()

  // 모든 세그먼트에서 이슈들을 추출
  const issues = useMemo(() => {
    const allIssues: IssueWithSegment[] = []
    segments.forEach((segment) => {
      if (segment.issues && segment.issues.length > 0) {
        segment.issues.forEach((issue) => {
          allIssues.push({
            ...issue,
            segmentId: segment.id,
            segmentStart: segment.start,
          })
        })
      }
    })
    // 해결되지 않은 이슈를 먼저, 그 다음 severity 순으로 정렬
    return allIssues.sort((a, b) => {
      if (a.resolved !== b.resolved) {
        return a.resolved ? 1 : -1
      }
      const severityOrder = { high: 0, medium: 1, low: 2 }
      const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] ?? 3
      const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] ?? 3
      return aSeverity - bSeverity
    })
  }, [segments])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return '심각'
      case 'medium':
        return '보통'
      case 'low':
        return '양호'
      default:
        return severity
    }
  }

  // 이슈 타입별 레이블
  const getIssueTypeLabel = (issueType: string) => {
    const typeLabels: Record<string, string> = {
      stt_quality: '음성인식 품질',
      tts_quality: '음성변환 품질',
      sync_duration: '싱크 차이',
      speaker_identification: '화자 구분',
    }
    return typeLabels[issueType] || issueType
  }

  // 이슈 타입별 메시지
  const getIssueMessage = (issueType: string, diff?: string) => {
    switch (issueType) {
      case 'stt_quality':
        return '음성 인식 품질이 기준치 이하입니다'
      case 'tts_quality':
        return '음성 변환 품질이 기준치 이하입니다'
      case 'sync_duration':
        return diff
          ? `원본과 ${Number(diff) > 0 ? '+' : ''}${Number(diff).toFixed(1)}% 차이가 있습니다`
          : '원본과 길이 차이가 있습니다'
      case 'speaker_identification':
        return '화자를 정확히 구분하지 못했습니다'
      default:
        return '이슈가 감지되었습니다'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handleIssueClick = (segmentId: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    // segments에서 현재 segmentId에 해당하는 세그먼트를 찾아서 최신 start 값을 사용
    const segment = storeSegments.find((seg) => seg.id === segmentId)
    if (!segment) return

    setPlayhead(segment.start - 0.025)
    setPlaying(false)

    // 클릭 후 포커스 제거하여 스페이스바가 비디오 재생에 사용되도록 함
    if (event) {
      const target = event.currentTarget as HTMLElement
      target.blur()
    }
  }

  // 싱크 차이를 얇고 간단하게 시각화
  const renderCompactSyncBar = (diff: number) => {
    const maxDiff = 30
    const clampedDiff = Math.max(-maxDiff, Math.min(maxDiff, diff))
    const absValue = Math.abs(clampedDiff)
    const intensity = Math.min(absValue / maxDiff, 1)

    let barColor = 'bg-green-500'
    if (intensity > 0.7) {
      barColor = 'bg-red-500'
    } else if (intensity > 0.4) {
      barColor = 'bg-orange-500'
    } else if (intensity > 0.15) {
      barColor = 'bg-yellow-500'
    }

    return (
      <div className="flex items-center gap-1">
        <div className="relative h-1 w-16 rounded-full bg-surface-3">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-muted/30" />
          <div
            className={`absolute top-0 h-full w-0.5 rounded-full ${barColor} -translate-x-1/2`}
            style={{ left: `${((clampedDiff + maxDiff) / (maxDiff * 2)) * 100}%` }}
          />
        </div>
        <span
          className={`text-[10px] font-medium ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-blue-600' : 'text-green-600'}`}
        >
          {diff > 0 ? '+' : ''}
          {diff.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <section className="flex h-full flex-col rounded border border-surface-3 bg-white p-3">
      <div className="mb-3 flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-foreground">목록</h3>
        {issues.length > 0 && (
          <span className="text-sm text-muted">
            {issues.filter((i) => !i.resolved).length}/{issues.length}
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="text-sm text-muted">
          <p>현재 이슈가 없습니다.</p>
        </div>
      ) : (
        <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto pr-1">
          {issues.map((issue) => (
            <div
              key={`${issue.segmentId}-${issue.id}`}
              className={`group flex cursor-pointer items-center gap-3 rounded border border-surface-3 px-3 py-2 text-xs transition-all hover:border-primary/30 hover:bg-surface-1 ${
                issue.resolved ? 'opacity-50' : ''
              }`}
              onClick={(e) => handleIssueClick(issue.segmentId, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleIssueClick(issue.segmentId, e)
                }
              }}
            >
              {/* 심각도 */}
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${getSeverityColor(
                  issue.severity,
                )}`}
              >
                {getSeverityLabel(issue.severity)}
              </span>

              {/* 이슈 내용 */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate font-medium text-foreground">
                  {getIssueTypeLabel(issue.issue_type)}
                </span>
                <span className="truncate text-muted">
                  {getIssueMessage(issue.issue_type, issue.diff)}
                </span>

                {/* 싱크 차이 바 */}
                {issue.diff !== undefined && issue.issue_type === 'sync_duration' && (
                  <div className="shrink-0">{renderCompactSyncBar(Number(issue.diff))}</div>
                )}
              </div>

              {/* 해결 상태 */}
              {issue.resolved && (
                <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  해결됨
                </span>
              )}

              {/* 타임스탬프 - 강조 */}
              <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {formatTime(issue.segmentStart)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
