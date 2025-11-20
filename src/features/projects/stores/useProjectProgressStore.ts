import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  ProjectProgress,
  ProjectProgressState,
  ProjectStatus,
  TargetProgress,
} from '../types/progress'

interface ProjectProgressActions {
  // Connection management
  setConnectionStatus: (
    status: 'connecting' | 'connected' | 'disconnected' | 'error',
  ) => void
  setConnectionError: (error: string | null) => void
  setLastHeartbeat: (timestamp: string) => void

  // Progress updates
  updateTargetProgress: (
    projectId: string,
    targetLang: string,
    progress: Omit<TargetProgress, 'targetLang'>,
  ) => void
  updateProjectProgress: (
    projectId: string,
    status: ProjectStatus,
    overallProgress: number,
    message: string,
    timestamp: string,
  ) => void

  // Getters
  getProjectProgress: (projectId: string) => ProjectProgress | undefined
  getTargetProgress: (projectId: string, targetLang: string) => TargetProgress | undefined
  getAllActiveProjects: () => ProjectProgress[]

  // Cleanup
  clearProjectProgress: (projectId: string) => void
  clearAllProgress: () => void
  reset: () => void
}

const initialState: ProjectProgressState = {
  projects: {},
  connectionStatus: 'disconnected',
  lastHeartbeat: null,
  connectionError: null,
}

export const useProjectProgressStore = create<ProjectProgressState & ProjectProgressActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Connection management
      setConnectionStatus: (status) =>
        set(
          { connectionStatus: status },
          false,
          { type: 'progress/setConnectionStatus', payload: status },
        ),

      setConnectionError: (error) =>
        set(
          { connectionError: error },
          false,
          { type: 'progress/setConnectionError', payload: error },
        ),

      setLastHeartbeat: (timestamp) =>
        set(
          { lastHeartbeat: timestamp },
          false,
          { type: 'progress/setLastHeartbeat', payload: timestamp },
        ),

      // Progress updates
      updateTargetProgress: (projectId, targetLang, progress) =>
        set(
          (state) => {
            const project = state.projects[projectId] || {
              projectId,
              status: 'pending',
              overallProgress: 0,
              message: '',
              timestamp: new Date().toISOString(),
              targets: {},
            }

            return {
              projects: {
                ...state.projects,
                [projectId]: {
                  ...project,
                  targets: {
                    ...project.targets,
                    [targetLang]: {
                      targetLang,
                      ...progress,
                    },
                  },
                },
              },
            }
          },
          false,
          {
            type: 'progress/updateTargetProgress',
            payload: { projectId, targetLang, progress }
          },
        ),

      updateProjectProgress: (projectId, status, overallProgress, message, timestamp) =>
        set(
          (state) => {
            const project = state.projects[projectId] || {
              projectId,
              status: 'pending',
              overallProgress: 0,
              message: '',
              timestamp,
              targets: {},
            }

            return {
              projects: {
                ...state.projects,
                [projectId]: {
                  ...project,
                  status,
                  overallProgress,
                  message,
                  timestamp,
                },
              },
            }
          },
          false,
          {
            type: 'progress/updateProjectProgress',
            payload: { projectId, status, overallProgress, message, timestamp }
          },
        ),

      // Getters
      getProjectProgress: (projectId) => {
        return get().projects[projectId]
      },

      getTargetProgress: (projectId, targetLang) => {
        const project = get().projects[projectId]
        return project?.targets[targetLang]
      },

      getAllActiveProjects: () => {
        return Object.values(get().projects).filter(
          (project) => project.status === 'processing'
        )
      },

      // Cleanup
      clearProjectProgress: (projectId) =>
        set(
          (state) => {
            const { [projectId]: _, ...remainingProjects } = state.projects
            return { projects: remainingProjects }
          },
          false,
          { type: 'progress/clearProjectProgress', payload: projectId },
        ),

      clearAllProgress: () =>
        set(
          { projects: {} },
          false,
          { type: 'progress/clearAllProgress' },
        ),

      reset: () =>
        set(
          initialState,
          false,
          { type: 'progress/reset' },
        ),
    }),
    { name: 'project-progress-store' },
  ),
)