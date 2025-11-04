import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { TranslatorAssignment } from '@/pages/TranslatorPage'
import { Languages } from 'lucide-react'

interface TranslatorAssignmentCardProps {
  assignment: TranslatorAssignment
  onOpen(assignment: TranslatorAssignment): void
}

export function TranslatorAssignmentCard({ assignment, onOpen }: TranslatorAssignmentCardProps) {
  const statusLabel =
    assignment.status === 'completed'
      ? '완료'
      : assignment.status === 'processing'
        ? '진행 중'
        : assignment.status === 'review'
          ? '검토 중'
          : '대기 중'

  return (
    <Card className="bg-white/80 border border-gray-200 shadow-sm">
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
          <span>상태: {statusLabel}</span>
          <span>진행률: {Math.round(assignment.progress ?? 0)}%</span>
        </div>
        <Progress value={assignment.progress ?? 0} />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => onOpen(assignment)}>
            번역 편집하기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
