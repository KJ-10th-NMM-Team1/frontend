import {
  TranslatorAssignments,
  type TranslatorAssignment,
} from '@/components/TranslatorAssignments'
import { TranslatorEditorShell } from '@/components/TranslatorEditorShell'
import { fetchProjects } from '@/features/projects/services/projects'
import type { Project } from '@/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
      <TranslatorAssignments
        assignments={visibleAssignments}
        onOpenAssignment={setActiveAssignment}
      />
    </div>
  )
}
