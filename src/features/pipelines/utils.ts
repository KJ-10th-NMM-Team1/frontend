import {
  PIPELINE_STAGE_META,
  type IPipelineStage,
  type PipelineEventPayload,
  type PipelineSummary,
} from './types'

export function enrichStage(stage: Partial<IPipelineStage> & { id: string }): IPipelineStage {
  const meta = PIPELINE_STAGE_META[stage.id] ?? {}
  return {
    id: stage.id,
    title: stage.title ?? meta.title ?? stage.id,
    description: stage.description ?? meta.description,
    estimatedTime: stage.estimatedTime ?? meta.estimatedTime,
    status: stage.status ?? 'pending',
    progress: stage.progress ?? 0,
    startedAt: stage.startedAt,
    endedAt: stage.endedAt,
    errorMessage: stage.errorMessage,
  }
}

export function enrichStages(
  stages: (Partial<IPipelineStage> & { id: string })[]
): IPipelineStage[] {
  return stages.map(enrichStage)
}

export function mergeStageUpdate(
  stages: IPipelineStage[],
  event: PipelineEventPayload
): IPipelineStage[] {
  let found = false
  const next = stages.map((stage) => {
    if (stage.id !== event.stage) return stage
    found = true
    return enrichStage({
      ...stage,
      status: event.status,
      progress: event.progress ?? stage.progress,
      startedAt: stage.startedAt ?? event.timestamp,
      endedAt: event.status === 'completed' ? event.timestamp : stage.endedAt,
    })
  })

  if (!found) {
    next.push(
      enrichStage({
        id: event.stage,
        status: event.status,
        progress: event.progress ?? 0,
        startedAt: event.timestamp,
        endedAt: event.status === 'completed' ? event.timestamp : undefined,
      })
    )
  }

  return next
}

export function summarizeStages(stages: IPipelineStage[]): PipelineSummary {
  const counts = stages.reduce(
    (acc, stage) => {
      const key = stage.status
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const current =
    stages.find((stage) => stage.status === 'processing' || stage.status === 'review') ??
    stages.find((stage) => stage.status === 'pending')

  return {
    total: stages.length,
    completed: counts.completed ?? 0,
    processing: counts.processing ?? 0,
    pending: counts.pending ?? 0,
    failed: counts.failed ?? 0,
    review: counts.review ?? 0,
    currentStageId: current?.id,
    currentStageTitle: current?.title,
  }
}
