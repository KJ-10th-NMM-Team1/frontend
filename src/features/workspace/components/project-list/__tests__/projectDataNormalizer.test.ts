import { describe, expect, it } from 'vitest'

import type { ProjectSummary, ProjectTarget } from '@/entities/project/types'
import type { ProjectProgress } from '@/features/projects/types/progress'

import { normalizeProjectData, getStatusFlags } from '../projectDataNormalizer'

describe('projectDataNormalizer', () => {
  describe('normalizeProjectData', () => {
    const mockTargets: ProjectTarget[] = [
      {
        target_id: 't1',
        project_id: 'p1',
        language_code: 'en',
        status: 'processing',
        progress: 50,
      },
      {
        target_id: 't2',
        project_id: 'p1',
        language_code: 'ja',
        status: 'processing',
        progress: 30,
      },
    ]

    const mockApiProject: ProjectSummary = {
      id: 'p1',
      title: 'Test Project',
      status: 'asr_started', // 워커 stage 값
      targets: mockTargets,
      issue_count: 0,
      created_at: new Date(),
    }

    describe('API 데이터만 있는 경우 (새로고침 시나리오)', () => {
      it('워커 stage "asr_started"를 "processing"으로 정규화', () => {
        const result = normalizeProjectData(mockApiProject)

        expect(result.status).toBe('processing')
        expect(result.progress).toBe(40) // (50 + 30) / 2
        expect(result.message).toBeUndefined()
        expect(result.rawStatus).toBe('asr_started')
      })

      it('워커 stage "done"을 "completed"로 정규화하고 진행도 100%로 보정', () => {
        const completedProject: ProjectSummary = {
          ...mockApiProject,
          status: 'done',
          targets: [
            { ...mockTargets[0], status: 'completed', progress: 95 },
            { ...mockTargets[1], status: 'completed', progress: 98 },
          ],
        }

        const result = normalizeProjectData(completedProject)

        expect(result.status).toBe('completed')
        expect(result.progress).toBe(100) // completed 상태면 100%로 보정
        expect(result.rawStatus).toBe('done')
      })

      it('워커 stage "failed"를 "failed"로 정규화', () => {
        const failedProject: ProjectSummary = {
          ...mockApiProject,
          status: 'failed',
          targets: [
            { ...mockTargets[0], status: 'failed', progress: 30 },
            { ...mockTargets[1], status: 'failed', progress: 20 },
          ],
        }

        const result = normalizeProjectData(failedProject)

        expect(result.status).toBe('failed')
        expect(result.progress).toBe(25) // 실패 시점의 진행도 유지
        expect(result.rawStatus).toBe('failed')
      })

      it('다양한 워커 stage를 올바르게 정규화', () => {
        const testCases = [
          { apiStatus: 'starting', expected: 'processing' },
          { apiStatus: 'upload', expected: 'processing' },
          { apiStatus: 'translation_started', expected: 'processing' },
          { apiStatus: 'tts_completed', expected: 'processing' },
          { apiStatus: 'sync_started', expected: 'processing' },
          { apiStatus: 'mux_completed', expected: 'processing' },
          { apiStatus: 'pending', expected: 'pending' },
          { apiStatus: 'waiting', expected: 'pending' },
          { apiStatus: 'error_occurred', expected: 'failed' },
        ]

        testCases.forEach(({ apiStatus, expected }) => {
          const project = { ...mockApiProject, status: apiStatus }
          const result = normalizeProjectData(project)
          expect(result.status).toBe(expected)
        })
      })
    })

    describe('SSE 데이터가 있는 경우 (실시간 업데이트 시나리오)', () => {
      const mockSseProgress: ProjectProgress = {
        projectId: 'p1',
        status: 'processing',
        overallProgress: 75,
        message: '번역 처리 중...',
        timestamp: new Date().toISOString(),
        targets: {},
      }

      it('SSE 데이터를 우선 사용', () => {
        const result = normalizeProjectData(mockApiProject, mockSseProgress)

        expect(result.status).toBe('processing')
        expect(result.progress).toBe(75) // SSE의 overallProgress 사용
        expect(result.message).toBe('번역 처리 중...')
        expect(result.rawStatus).toBe('processing')
      })

      it('SSE completed 상태 처리', () => {
        const completedSse: ProjectProgress = {
          ...mockSseProgress,
          status: 'completed',
          overallProgress: 100,
          message: '처리 완료',
        }

        const result = normalizeProjectData(mockApiProject, completedSse)

        expect(result.status).toBe('completed')
        expect(result.progress).toBe(100)
        expect(result.message).toBe('처리 완료')
      })
    })

    describe('데이터 전환 시나리오', () => {
      it('SSE 연결이 끊어진 후 API 데이터로 폴백', () => {
        // 1. 초기: API 데이터만 있음
        const result1 = normalizeProjectData(mockApiProject)
        expect(result1.status).toBe('processing')
        expect(result1.progress).toBe(40)

        // 2. SSE 연결되어 실시간 데이터 수신
        const sseData: ProjectProgress = {
          projectId: 'p1',
          status: 'processing',
          overallProgress: 60,
          message: '처리 중...',
          timestamp: new Date().toISOString(),
          targets: {},
        }
        const result2 = normalizeProjectData(mockApiProject, sseData)
        expect(result2.status).toBe('processing')
        expect(result2.progress).toBe(60)

        // 3. SSE 연결 끊김 - undefined 전달 시 API 데이터 사용
        const result3 = normalizeProjectData(mockApiProject, undefined)
        expect(result3.status).toBe('processing')
        expect(result3.progress).toBe(40)
      })

      it('API "done" 상태와 SSE "completed" 상태가 동일하게 처리', () => {
        const apiDone = { ...mockApiProject, status: 'done' }
        const sseCompleted: ProjectProgress = {
          projectId: 'p1',
          status: 'completed',
          overallProgress: 100,
          message: '완료',
          timestamp: new Date().toISOString(),
          targets: {},
        }

        const apiResult = normalizeProjectData(apiDone)
        const sseResult = normalizeProjectData(mockApiProject, sseCompleted)

        // 둘 다 completed로 정규화되어야 함
        expect(apiResult.status).toBe('completed')
        expect(sseResult.status).toBe('completed')
        expect(apiResult.progress).toBe(100)
        expect(sseResult.progress).toBe(100)
      })
    })
  })

  describe('getStatusFlags', () => {
    it('processing 상태 플래그', () => {
      const flags = getStatusFlags({
        status: 'processing',
        progress: 50,
        rawStatus: 'asr_started',
      })

      expect(flags.isProcessing).toBe(true)
      expect(flags.isPending).toBe(false)
      expect(flags.isCompleted).toBe(false)
      expect(flags.isFailed).toBe(false)
    })

    it('completed 상태 플래그', () => {
      const flags = getStatusFlags({
        status: 'completed',
        progress: 100,
        rawStatus: 'done',
      })

      expect(flags.isProcessing).toBe(false)
      expect(flags.isPending).toBe(false)
      expect(flags.isCompleted).toBe(true)
      expect(flags.isFailed).toBe(false)
    })

    it('progress 100%면 completed 플래그 true', () => {
      const flags = getStatusFlags({
        status: 'processing',
        progress: 100,
        rawStatus: 'packaging',
      })

      expect(flags.isProcessing).toBe(false) // 100%면 processing 아님
      expect(flags.isCompleted).toBe(true)
    })
  })
})