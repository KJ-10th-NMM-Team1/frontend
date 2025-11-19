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
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return severity
    }
  }

  // 이슈 타입별 레이블
  const getIssueTypeLabel = (issueType: string) => {
    const typeLabels: Record<string, string> = {
      stt_quality: 'STT 품질',
      tts_quality: 'TTS 품질',
      sync_duration: '싱크 차이',
      speaker_identification: '화자 식별',
    }
    return typeLabels[issueType] || issueType
  }

  // 이슈 타입별 메시지
  const getIssueMessage = (issueType: string, score?: string, diff?: string) => {
    switch (issueType) {
      case 'stt_quality':
        return score
          ? `음성 인식 정확도가 ${Number(score).toFixed(1)}%로 기준치 이하입니다`
          : '음성 인식 품질이 기준치 이하입니다'
      case 'tts_quality':
        return score
          ? `음성 합성 품질이 ${Number(score).toFixed(1)}점으로 기준치 이하입니다`
          : '음성 합성 품질이 기준치 이하입니다'
      case 'sync_duration':
        return diff
          ? `원본과 ${Number(diff) > 0 ? '+' : ''}${Number(diff).toFixed(1)} 싱크 차이가 있습니다`
          : '원본과 길이 차이가 있습니다'
      case 'speaker_identification':
        return '화자를 정확히 식별하지 못했습니다'
      default:
        return '이슈가 감지되었습니다'
    }
  }

  // 점수가 필요한 이슈 타입인지 확인
  const shouldShowScore = (issueType: string) => {
    return ['stt_quality', 'tts_quality'].includes(issueType)
  }

  // 점수 레이블 가져오기
  const getScoreLabel = (issueType: string) => {
    const scoreLabels: Record<string, string> = {
      stt_quality: 'STT 정확도',
      tts_quality: 'TTS 품질',
    }
    return scoreLabels[issueType] || '점수'
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

  // Sync diff를 시각화하는 컴포넌트 (크기 축소)
  const renderSyncBar = (diff: number) => {
    // diff 범위: -30 ~ +30으로 가정
    const maxDiff = 30
    const clampedDiff = Math.max(-maxDiff, Math.min(maxDiff, diff))

    // 0~100% 위치 계산 (0이 50%)
    const percentage = ((clampedDiff + maxDiff) / (maxDiff * 2)) * 100

    // 색상 계산: 0에서 멀수록 빨강
    const absValue = Math.abs(clampedDiff)
    const intensity = Math.min(absValue / maxDiff, 1)

    let bgColor = 'bg-green-500'
    if (intensity > 0.7) {
      bgColor = 'bg-red-500'
    } else if (intensity > 0.4) {
      bgColor = 'bg-orange-500'
    } else if (intensity > 0.15) {
      bgColor = 'bg-yellow-500'
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className="w-6 text-right text-[9px] text-muted">-{maxDiff}</span>
        <div className="relative h-1.5 w-20 rounded-full bg-gray-200">
          {/* 중앙선 (0 위치) */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gray-400" />

          {/* 현재 값 표시 */}
          <div
            className={`absolute top-0 h-full w-1 rounded-full ${bgColor} -translate-x-1/2 transition-all`}
            style={{ left: `${percentage}%` }}
          />
        </div>
        <span className="w-6 text-[9px] text-muted">+{maxDiff}</span>

        {/* 실제 값 표시 */}
        <span
          className={`font-mono text-[10px] font-semibold ${
            diff > 0 ? 'text-red-600' : diff < 0 ? 'text-blue-600' : 'text-green-600'
          }`}
        >
          {diff > 0 ? '+' : ''}
          {diff.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <section className="rounded border border-surface-3 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">더빙 이슈</h3>
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
        <div className="scrollbar-thin max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {issues.map((issue) => (
            <div
              key={`${issue.segmentId}-${issue.id}`}
              className={`cursor-pointer rounded border p-3 text-sm transition-opacity hover:bg-surface-1 ${
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
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded border px-2 py-1 text-xs font-medium ${getSeverityColor(
                      issue.severity,
                    )}`}
                  >
                    {getSeverityLabel(issue.severity)}
                  </span>
                  <span className="rounded bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                    {getIssueTypeLabel(issue.issue_type)}
                  </span>
                  {issue.resolved && (
                    <span className="rounded border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      해결됨
                    </span>
                  )}
                </div>
                <span className="whitespace-nowrap text-xs text-muted">
                  {formatTime(issue.segmentStart)}
                </span>
              </div>

              {/* 이슈 메시지 */}
              <div className="mb-2 text-xs text-foreground/80">
                {getIssueMessage(issue.issue_type, issue.score, issue.diff)}
              </div>

              {/* Score & Diff */}
              {(issue.score !== undefined || issue.diff !== undefined) && (
                <div className="flex items-center gap-4">
                  {/* 점수는 특정 타입일 때만 표시 */}
                  {issue.score !== undefined && shouldShowScore(issue.issue_type) && (
                    <div className="text-xs">
                      <span className="text-muted">{getScoreLabel(issue.issue_type)}: </span>
                      <span className="font-medium text-foreground">
                        {Number(issue.score).toFixed(1)}
                        {issue.issue_type === 'stt_quality' ? '%' : '점'}
                      </span>
                    </div>
                  )}
                  {/* 싱크 차이 바 */}
                  {issue.diff !== undefined && issue.issue_type === 'sync_duration' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted">싱크:</span>
                      {renderSyncBar(Number(issue.diff))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
