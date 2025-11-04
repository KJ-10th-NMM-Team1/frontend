import { PipelineStage } from '@/components/PipelineStage'
import { type FC } from 'react'
import type { IPipelineStage } from '../types'

interface PipelinesProps {
  pipelines: IPipelineStage[]
  onStageEdit?(stageId: string): void
}

const Pipelines: FC<PipelinesProps> = ({ pipelines, onStageEdit }) => {
  return (
    <>
      {pipelines.map((pipeline) => (
        <PipelineStage
          key={pipeline.id}
          title={pipeline.title}
          description={pipeline.description}
          status={pipeline.status}
          progress={pipeline.progress}
          estimatedTime={pipeline.estimatedTime}
          onEdit={
            pipeline.id === 'rag' || pipeline.id === 'voice_mapping' || pipeline.id === 'outputs'
              ? () => onStageEdit?.(pipeline.id)
              : undefined
          }
          showEditButton={pipeline.id === 'rag' || pipeline.id === 'voice_mapping' || pipeline.id === 'outputs'}
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
      ))}
    </>
  )
}

export default Pipelines
