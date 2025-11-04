import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getProjectStatusLabel, getProjectStatusStyle } from '@/features/projects/services/projects'
import type { TranslatorAssignment } from '@/pages/TranslatorPage'
import { Languages, AlertTriangle } from 'lucide-react'

interface TranslatorAssignmentCardProps {
  assignment: TranslatorAssignment
  onOpen(assignment: TranslatorAssignment): void
}

export function TranslatorAssignmentCard({ assignment, onOpen }: TranslatorAssignmentCardProps) {
  //   console.log('Renderer assignment card', assignment)
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
          <span className={`text-xs px-2 py-1 rounded ${getProjectStatusStyle(assignment.status)}`}>
            <span>{getProjectStatusLabel(assignment.status)}</span>
          </span>
          <span>진행률: {Math.round(assignment.progress ?? 0)}%</span>
        </div>
        <Progress value={assignment.progress ?? 0} />
        {(assignment.issueCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <AlertTriangle className="w-3 h-3" />
            <span>{assignment.issueCount}개 이슈</span>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={() => onOpen(assignment)}
          >
            편집하기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
