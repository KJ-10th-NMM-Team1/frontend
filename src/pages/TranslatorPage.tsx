import { TranslatorEditorShell } from '@/components/TranslatorEditorShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fetchProjects } from '@/features/projects/services/projects'
import type { Project } from '@/types'
import { ClipboardList, Languages } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

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

export default function TranslatorDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTranslator, setSelectedTranslator] = useState('')
  const [activeAssignment, setActiveAssignment] = useState<TranslatorAssignment | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      const list = await fetchProjects()
      setProjects(list)
    } catch (err) {
      console.error('프로젝트 조회 실패', err)
    }
  }, [])

  useEffect(() => {
    loadProjects().catch(() => {})
  }, [loadProjects])

  const assignments = useMemo<TranslatorAssignment[]>(
    () =>
      projects.flatMap((project) =>
        project.languages.map((lang) => ({
          projectId: project.id,
          projectName: project.name,
          languageCode: lang.code,
          languageName: lang.name,
          status: lang.status,
          progress: lang.progress,
          translator: lang.translator ?? '',
          isDubbing: lang.dubbing,
        }))
      ),
    [projects]
  )

  const translatorNames = useMemo(() => {
    const names = new Set<string>()
    assignments.forEach((assignment) => {
      if (assignment.translator) names.add(assignment.translator)
    })
    return Array.from(names)
  }, [assignments])

  useEffect(() => {
    if (translatorNames.length === 0) {
      setSelectedTranslator('')
      return
    }
    if (!selectedTranslator || !translatorNames.includes(selectedTranslator)) {
      setSelectedTranslator(translatorNames[0])
    }
  }, [translatorNames, selectedTranslator])

  useEffect(() => {
    if (
      activeAssignment &&
      selectedTranslator &&
      activeAssignment.translator !== selectedTranslator
    ) {
      setActiveAssignment(null)
    }
  }, [activeAssignment, selectedTranslator])

  if (activeAssignment) {
    return (
      <TranslatorEditorShell
        assignment={activeAssignment}
        onBack={() => setActiveAssignment(null)}
      />
    )
  }

  const visibleAssignments =
    selectedTranslator === ''
      ? assignments
      : assignments.filter((a) => a.translator === selectedTranslator)

  return (
    <div className="space-y-6">
      {visibleAssignments.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-white/70 text-center py-16">
          <CardHeader className="items-center">
            <ClipboardList className="w-8 h-8 text-gray-300" />
            <CardTitle className="text-base">할당된 작업이 없습니다</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            배급자에게 작업을 요청받으면 이곳에 목록이 표시됩니다.
          </CardContent>
        </Card>
      ) : (
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
                  <Button size="sm" onClick={() => setActiveAssignment(assignment)}>
                    번역 편집하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
