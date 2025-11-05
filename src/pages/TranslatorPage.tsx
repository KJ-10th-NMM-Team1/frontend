import { TranslatorAssignmentCard } from '@/components/TranslatorAssignmentCard'
import { TranslatorEditorShell } from '@/components/TranslatorEditorShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchProjectsByOwner } from '@/features/projects/services/projects'
import type { Project } from '@/types'
import { ClipboardList } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface TranslatorAssignment {
  projectId: string
  projectName: string
  languageCode: string
  languageName: string
  translator: string
  status: string
  progress?: number
  isDubbing?: boolean
  issueCount?: number
}

export default function TranslatorDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTranslator, setSelectedTranslator] = useState('')
  const [activeAssignment, setActiveAssignment] = useState<TranslatorAssignment | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      const list = await fetchProjectsByOwner()
      setProjects(list)
    } catch (err) {
      console.error('프로젝트 조회 실패', err)
    }
  }, [])

  useEffect(() => {
    loadProjects().catch(() => {})
  }, [loadProjects])

  const assignments = useMemo<TranslatorAssignment[]>(() => {
    return projects.map((project) => ({
      projectId: project.id,
      projectName: project.name,
      status: project.status,
      progress: project.languages?.[0]?.progress ?? project.uploadProgress ?? 0,
      translator: project.languages?.[0]?.translator ?? '',
      languageCode: project.languages?.[0]?.code ?? '',
      languageName: project.languages?.[0]?.name ?? '',
      isDubbing: project.languages?.[0]?.dubbing ?? false,
      issueCount: project.issue_count ?? 0,
    }))
  }, [projects])

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

  // console.log('visible assignments', visibleAssignments)

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAssignments.map((assignment) => (
            <TranslatorAssignmentCard
              key={`${assignment.projectId}-${assignment.languageCode}`}
              assignment={assignment}
              onOpen={setActiveAssignment}
            />
          ))}
        </div>
      )}
    </div>
  )
}
