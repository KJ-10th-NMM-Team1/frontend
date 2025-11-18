/**
 * 더빙 이슈 표시 섹션
 */

import { useMemo } from 'react'

import type { Issue } from '@/entities/issue/types'
import type { Segment } from '@/entities/segment/types'
import { useEditorStore } from '@/shared/store/useEditorStore'

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

  const getIssueTypeLabel = (issueType: string) => {
    const typeLabels: Record<string, string> = {
      sync: '동기화',
      quality: '품질',
      translation: '번역',
      duration: '길이',
      volume: '볼륨',
      pronunciation: '발음',
    }
    return typeLabels[issueType] || issueType
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handleIssueClick = (segmentStart: number) => {
    setPlayhead(segmentStart)
    setPlaying(false)
  }

  return (
    <section className="rounded border border-surface-3 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">더빙 이슈</h3>
        {issues.length > 0 && (
          <span className="text-xs text-muted">
            {issues.filter((i) => !i.resolved).length}/{issues.length}
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="text-xs text-muted">
          <p>현재 이슈가 없습니다.</p>
        </div>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {issues.map((issue) => (
            <div
              key={`${issue.segmentId}-${issue.id}`}
              className={`cursor-pointer rounded border p-2 text-xs transition-opacity hover:bg-surface-1 ${
                issue.resolved ? 'opacity-50' : ''
              }`}
              onClick={() => handleIssueClick(issue.segmentStart)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleIssueClick(issue.segmentStart)
                }
              }}
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${getSeverityColor(
                      issue.severity,
                    )}`}
                  >
                    {getSeverityLabel(issue.severity)}
                  </span>
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                    {getIssueTypeLabel(issue.issue_type)}
                  </span>
                  {issue.resolved && (
                    <span className="rounded border border-green-200 bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                      해결됨
                    </span>
                  )}
                </div>
                <span className="whitespace-nowrap text-[10px] text-muted">
                  {formatTime(issue.segmentStart)}
                </span>
              </div>

              {/* Score & Diff */}
              {(issue.score !== undefined || issue.diff !== undefined) && (
                <div className="mb-1 flex gap-3 text-[10px] text-muted">
                  {issue.score !== undefined && <span>점수: {Number(issue.score).toFixed(2)}</span>}
                  {issue.diff !== undefined && (
                    <span className={Number(issue.diff) > 0 ? 'text-red-600' : 'text-green-600'}>
                      차이: {Number(issue.diff) > 0 ? '+' : ''}
                      {Number(issue.diff).toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              {/* Details */}
              {issue.details && Object.keys(issue.details).length > 0 && (
                <div className="text-[10px] text-muted">
                  {Object.entries(issue.details).map(([key, value]) => (
                    <div key={key}>
                      {key}: {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
