import { useState } from 'react'

import { Search, SlidersHorizontal } from 'lucide-react'

import { useProjects } from '../../features/projects/hooks/useProjects'
import { ProjectList } from '../../features/workspace/components/project-list/ProjectList'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Spinner } from '../../shared/ui/Spinner'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../../shared/ui/Tabs'

const tabs = [
  { value: 'assigned', label: '할당됨' },
  { value: 'done', label: '완료' },
]

export default function ProjectsListPage() {
  const { data: projectsResponse = [], isLoading } = useProjects()
  const projects = projectsResponse ?? []
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<'recent' | 'dueDate' | 'progress'>('recent')
  const [activeTab, setActiveTab] = useState('assigned')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
      <header className="space-y-4">
        <h1 className="text-foreground text-3xl font-semibold">에피소드 목록</h1>
        <p className="text-muted text-sm">
          생성된 프로젝트 목록과 더빙 진행 상황을 조회합니다. 검색과 정렬은 현 상태를 유지하며 상세
          페이지로 이동합니다.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="프로젝트 검색"
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={sortKey === 'recent' ? 'secondary' : 'outline'}
              onClick={() => setSortKey('recent')}
            >
              최신순
            </Button>
            <Button
              type="button"
              variant={sortKey === 'dueDate' ? 'secondary' : 'outline'}
              onClick={() => setSortKey('dueDate')}
            >
              마감 임박
            </Button>
            <Button
              type="button"
              variant={sortKey === 'progress' ? 'secondary' : 'outline'}
              onClick={() => setSortKey('progress')}
            >
              진행률
            </Button>
            <span className="bg-surface-2 text-muted ml-auto hidden items-center gap-2 rounded-full px-3 py-1 text-xs md:inline-flex">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              정렬 기준: {sortKey}
            </span>
          </div>
        </div>
      </header>

      <TabsRoot value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-10">
              <Spinner />
              <span className="text-muted ml-3 text-sm">목록을 불러오는 중…</span>
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
