import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ProjectDetail,
  ProjectPayload,
  ProjectsResponse,
  ProjectSummary,
} from '@/entities/project/types'
import { apiGet } from '@/shared/api/client'
import { queryKeys } from '@/shared/config/queryKeys'
// import { useUiStore } from '@/shared/store/useUiStore'

import { createProject, deleteProject, updateProject } from '../api/projectsApi'

export function useProjects() {
  return useQuery<ProjectsResponse, Error, ProjectSummary[]>({
    queryKey: queryKeys.projects.all,
    queryFn: () => apiGet<ProjectsResponse>('api/projects'),
    select: (data) => data.items,
    placeholderData: (previous) => previous,
  })
}

export function useProject(projectId: string) {
  return useQuery<ProjectDetail>({
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

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['projects', 'delete'],
    mutationFn: (projectId: string) => deleteProject(projectId), // 실제 API 호출
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
    onError: (error) => {
      console.error(error)
    },
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['projects', 'update'],
    mutationFn: ({ id, payload }: { id: string; payload: ProjectPayload }) =>
      updateProject(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      // 필요하면 상세 캐시도 갱신: queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
    },
  })
}
