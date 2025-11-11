import { useMemo, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import { useLanguage } from '@/features/languages/hooks/useLanguage'

import { useProject } from '../../features/projects/hooks/useProjects'
import { routes } from '../../shared/config/routes'
import { trackEvent } from '../../shared/lib/analytics'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { Button } from '../../shared/ui/Button'
import { Spinner } from '../../shared/ui/Spinner'

import { ProjectLanguagePanel } from './components/ProjectLanguagePanel'
import { ProjectStudioPanel } from './components/ProjectStudioPanel'

export default function ProjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: project, isLoading } = useProject(id)
  const { data: languageData } = useLanguage()
  const roles = useAuthStore((state) => state.roles)
  const [language, setLanguage] = useState<string>()
  const [version, setVersion] = useState<'original' | 'translated'>('translated')
  const canEdit = roles.includes('editor')

  const languageNameMap = useMemo(() => {
    const items = languageData ?? []
    return items.reduce<Record<string, string>>((acc, item) => {
      acc[item.language_code] = item.name_ko
      return acc
    }, {})
  }, [languageData])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-foreground text-lg font-semibold">프로젝트를 찾을 수 없습니다.</p>
        <p className="text-muted text-sm">목록으로 돌아가 다시 시도하세요.</p>
        <Button asChild>
          <Link to={routes.projects}>프로젝트 목록으로</Link>
        </Button>
      </div>
    )
  }

  const projectId = project.id ?? (project as { _id?: string })._id ?? ''

  const projectTargets = project.targets ?? []
  const allTargetLanguageCodes = projectTargets.map((target) => target.language_code)
  const completedTargetLanguageCodes = projectTargets
    .filter((target) => target.status === 'completed')
    .map((target) => target.language_code)
  const sourceLanguageLabel = languageNameMap[project.source_language] ?? project.source_language
  const targetLanguageLabels = allTargetLanguageCodes.map((code) => languageNameMap[code] ?? code)

  const isSelectableLanguage =
    language &&
    (language === project.source_language || completedTargetLanguageCodes.includes(language))
  const activeLanguage =
    (isSelectableLanguage && language) || completedTargetLanguageCodes[0] || project.source_language
  const isSourceLanguage = activeLanguage === project.source_language

  // useEffect(() => {
  //   if (isSourceLanguage && version !== 'original') {
  //     setVersion('original')
  //   }

  //   if (!isSourceLanguage && version !== 'translated') {
  //     setVersion('translated')
  //   }
  // }, [isSourceLanguage, version, setVersion])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">프로젝트 상세</p>
          <h1 className="text-foreground mt-1 text-3xl font-semibold">{project.title}</h1>
          <p className="text-muted mt-2 text-sm">
            {sourceLanguageLabel} → {targetLanguageLabels.join(', ')} | 화자 {project.speaker_count}
            명
          </p>
          <p className="text-muted text-xs">
            생성일 {new Date(project.created_at).toLocaleString()}
          </p>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-3">
            <Button asChild onClick={() => trackEvent('enter_editor_click', { projectId })}>
              <Link to={routes.editor(projectId, activeLanguage)}>편집하기</Link>
            </Button>
          </div>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.75fr,1fr]">
        <ProjectLanguagePanel
          project={project}
          activeLanguage={activeLanguage}
          onLanguageChange={setLanguage}
          version={version}
          onVersionChange={setVersion}
          assetsByLanguage={{}}
          languageNameMap={languageNameMap}
        />
        <ProjectStudioPanel
          projectId={projectId}
          selectedLanguageCode={activeLanguage}
          isSourceLanguage={isSourceLanguage}
        />
      </section>
    </div>
  )
}
