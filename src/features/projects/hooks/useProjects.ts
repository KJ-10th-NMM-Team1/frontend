import { useMutation, useQuery } from '@tanstack/react-query'

import type { ProjectDetail, ProjectPayload, ProjectsResponse } from '@/entities/project/types'
import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'
// import { useUiStore } from '@/shared/store/useUiStore'

import { createProject } from '../api/projectsApi'

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => apiGet<ProjectsResponse>('api/projects'),
    select: (data) => data.items,
    placeholderData: (previous) => previous,
    // enabled: false,
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => apiGet<ProjectDetail>(`api/projects/${projectId}`),
    enabled: Boolean(projectId),
  })
}

export function useCreateProjectMutation() {
  // const queryClient = useQueryClient()
  // const showToast = useUiStore((state) => state.showToast)

  return useMutation({
    mutationKey: ['example', 'create'],
    mutationFn: (payload: ProjectPayload) => createProject(payload),
    onSuccess: () => {
      // void queryClient.invalidateQueries({ queryKey: queryKeys.example.all })
      // showToast({
      //   id: 'example-create-success',
      //   title: '프로젝트 생성 후 업로드 진행 중',
      //   autoDismiss: 2500,
      // })
    },
  })
}
