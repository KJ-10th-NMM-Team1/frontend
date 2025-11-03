import { ClipboardList, Languages } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'

export interface TranslatorAssignment {
  projectId: string
  projectName: string
  languageCode: string
  languageName: string
  translator: string
  status?: string
  progress?: number
  isDubbing?: boolean
}

interface TranslatorAssignmentsProps {
  assignments: TranslatorAssignment[]
  onOpenAssignment: (assignment: TranslatorAssignment) => void
}

export function TranslatorAssignments({
  assignments,
  onOpenAssignment,
}: TranslatorAssignmentsProps) {
  if (assignments.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-200 bg-white/70 text-center py-16">
        <CardHeader className="items-center">
          <ClipboardList className="w-8 h-8 text-gray-300" />
          <CardTitle className="text-base">할당된 작업이 없습니다</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-500">
          배급자에게 작업을 요청받으면 이곳에 목록이 표시됩니다.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((assignment) => (
        <Card
          key={`${assignment.projectId}-${assignment.languageCode}`}
          className="bg-white/80 border border-gray-200 shadow-sm"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{assignment.projectName}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Languages className="w-3 h-3" />
              <span>{assignment.languageName}</span>
              {assignment.isDubbing ? (
                <Badge className="text-[10px]" variant="secondary">
                  더빙
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                상태:{' '}
                {assignment.status === 'completed'
                  ? '완료'
                  : assignment.status === 'processing'
                    ? '진행 중'
                    : assignment.status === 'review'
                      ? '검토 중'
                      : '대기 중'}
              </span>
              <span>진행률: {Math.round(assignment.progress ?? 0)}%</span>
            </div>
            <Progress value={assignment.progress ?? 0} />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => onOpenAssignment(assignment)}>
                번역 편집하기
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
