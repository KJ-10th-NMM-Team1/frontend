import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Segment } from '@/entities/segment/types'
import type { EditorVersion } from '@/entities/version/types'

/**
 * 버전 관리를 위한 키 생성
 * @param projectId 프로젝트 ID
 * @param languageCode 언어 코드
 */
const getVersionKey = (projectId: string, languageCode: string) =>
  `${projectId}:${languageCode}`

type VersionState = {
  // 언어별 버전 저장: { "projectId:languageCode": EditorVersion[] }
  versionsByLanguage: Record<string, EditorVersion[]>
  // 언어별 현재 선택된 버전 ID: { "projectId:languageCode": versionId }
  currentVersionIdByLanguage: Record<string, string | null>

  // Actions
  initializeVersion0: (projectId: string, languageCode: string, segments: Segment[]) => void
  createVersion: (
    projectId: string,
    languageCode: string,
    segments: Segment[],
    description?: string,
  ) => void
  deleteVersion: (projectId: string, languageCode: string, versionId: string) => void
  setCurrentVersion: (projectId: string, languageCode: string, versionId: string) => void
  getVersions: (projectId: string, languageCode: string) => EditorVersion[]
  getCurrentVersionId: (projectId: string, languageCode: string) => string | null
  getVersion: (projectId: string, languageCode: string, versionId: string) => EditorVersion | undefined
  resetLanguage: (projectId: string, languageCode: string) => void
  reset: () => void
}

export const useVersionStore = create<VersionState>()(
  devtools((set, get) => ({
    // Initial state
    versionsByLanguage: {},
    currentVersionIdByLanguage: {},

    // Actions
    initializeVersion0: (projectId, languageCode, segments) => {
      const key = getVersionKey(projectId, languageCode)
      const { versionsByLanguage } = get()
      const existingVersions = versionsByLanguage[key] || []

      // 이미 version0이 존재하면 생성하지 않음
      if (existingVersions.length > 0) {
        return
      }

      const version0: EditorVersion = {
        id: 'v0',
        name: 'Version-0',
        createdAt: new Date(),
        segments: structuredClone(segments), // 깊은 복사로 스냅샷 생성
        description: '초기 버전',
      }

      set(
        (state) => ({
          versionsByLanguage: {
            ...state.versionsByLanguage,
            [key]: [version0],
          },
          currentVersionIdByLanguage: {
            ...state.currentVersionIdByLanguage,
            [key]: 'v0',
          },
        }),
        false,
        { type: 'version/initializeVersion0', payload: { projectId, languageCode } },
      )
    },

    createVersion: (projectId, languageCode, segments, description) => {
      const key = getVersionKey(projectId, languageCode)
      const { versionsByLanguage } = get()
      const existingVersions = versionsByLanguage[key] || []
      const versionNumber = existingVersions.length

      const newVersion: EditorVersion = {
        id: `v${versionNumber}`,
        name: `Version-${versionNumber}`,
        createdAt: new Date(),
        segments: structuredClone(segments),
        description,
      }

      set(
        (state) => ({
          versionsByLanguage: {
            ...state.versionsByLanguage,
            [key]: [...(state.versionsByLanguage[key] || []), newVersion],
          },
          currentVersionIdByLanguage: {
            ...state.currentVersionIdByLanguage,
            [key]: newVersion.id,
          },
        }),
        false,
        { type: 'version/createVersion', payload: { projectId, languageCode, version: newVersion } },
      )
    },

    deleteVersion: (projectId, languageCode, versionId) => {
      const key = getVersionKey(projectId, languageCode)

      set(
        (state) => {
          const versions = state.versionsByLanguage[key] || []
          const filteredVersions = versions.filter((v) => v.id !== versionId)
          const currentVersionId = state.currentVersionIdByLanguage[key]

          return {
            versionsByLanguage: {
              ...state.versionsByLanguage,
              [key]: filteredVersions,
            },
            currentVersionIdByLanguage: {
              ...state.currentVersionIdByLanguage,
              [key]: currentVersionId === versionId ? null : currentVersionId,
            },
          }
        },
        false,
        { type: 'version/deleteVersion', payload: { projectId, languageCode, versionId } },
      )
    },

    setCurrentVersion: (projectId, languageCode, versionId) => {
      const key = getVersionKey(projectId, languageCode)

      set(
        (state) => ({
          currentVersionIdByLanguage: {
            ...state.currentVersionIdByLanguage,
            [key]: versionId,
          },
        }),
        false,
        { type: 'version/setCurrentVersion', payload: { projectId, languageCode, versionId } },
      )
    },

    getVersions: (projectId, languageCode) => {
      const key = getVersionKey(projectId, languageCode)
      return get().versionsByLanguage[key] || []
    },

    getCurrentVersionId: (projectId, languageCode) => {
      const key = getVersionKey(projectId, languageCode)
      return get().currentVersionIdByLanguage[key] || null
    },

    getVersion: (projectId, languageCode, versionId) => {
      const key = getVersionKey(projectId, languageCode)
      const versions = get().versionsByLanguage[key] || []
      return versions.find((v) => v.id === versionId)
    },

    resetLanguage: (projectId, languageCode) => {
      const key = getVersionKey(projectId, languageCode)

      set(
        (state) => {
          const newVersionsByLanguage = { ...state.versionsByLanguage }
          const newCurrentVersionIdByLanguage = { ...state.currentVersionIdByLanguage }

          delete newVersionsByLanguage[key]
          delete newCurrentVersionIdByLanguage[key]

          return {
            versionsByLanguage: newVersionsByLanguage,
            currentVersionIdByLanguage: newCurrentVersionIdByLanguage,
          }
        },
        false,
        { type: 'version/resetLanguage', payload: { projectId, languageCode } },
      )
    },

    reset: () => {
      set(
        { versionsByLanguage: {}, currentVersionIdByLanguage: {} },
        false,
        { type: 'version/reset' },
      )
    },
  })),
)
