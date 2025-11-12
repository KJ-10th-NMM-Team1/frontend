import type { ProjectPayload, ProjectResponse, ProjectsResponse } from '@/entities/project/types'
import { apiClient } from '@/shared/api/client'

export async function fetchProjects() {
  return apiClient.get('api/projects').json<ProjectsResponse>()
}

export async function createProject(payload: ProjectPayload) {
  return apiClient.post('api/projects', { json: payload }).json<ProjectResponse>()
}

export async function updateProject(id: string, payload: ProjectPayload) {
  return apiClient.patch(`api/projects/${id}`, { json: payload }).json<ProjectResponse>()
}

export async function deleteProject(id: string) {
  await apiClient.delete(`api/projects/${id}`)
  return { id }
}
