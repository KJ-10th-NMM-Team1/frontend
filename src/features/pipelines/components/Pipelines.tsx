import { PipelineStage } from '@/components/PipelineStage'
import { type FC } from 'react'
import type { IPipelineStage } from '../types'

interface PipelinesProps {
  pipelines: IPipelineStage[]
  onStageEdit?(stageId: string): void
}

const Pipelines: FC<PipelinesProps> = ({ pipelines, onStageEdit }) => {
  // RAG 단계가 완료되었는지 확인
  const ragStage = pipelines.find((p) => p.id === 'rag')
  const isRagCompleted = ragStage?.status === 'completed'

  return (
    <>
      {pipelines.map((pipeline) => {
        // voice_mapping은 RAG 완료 후에만 활성화
        const canEditVoiceMapping = pipeline.id === 'voice_mapping' && isRagCompleted
        const canEdit = pipeline.id === 'rag' || canEditVoiceMapping || pipeline.id === 'outputs'

        return (
          <PipelineStage
            key={pipeline.id}
            title={pipeline.title}
            description={pipeline.description}
            status={pipeline.status}
            progress={pipeline.progress}
            estimatedTime={pipeline.estimatedTime}
            onEdit={canEdit ? () => onStageEdit?.(pipeline.id) : undefined}
            showEditButton={canEdit}
            editLabel={
              pipeline.id === 'rag'
                ? '번역가 지정'
                : pipeline.id === 'voice_mapping'
                  ? '보이스 설정'
                  : pipeline.id === 'outputs'
                    ? '산출물 확인'
                    : undefined
            }
          />
        )
      })}
    </>
  )
}

export default Pipelines
