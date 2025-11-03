import { PipelineStage } from '@/components/PipelineStage'
import { type FC } from 'react'
import type { IPipelineStage } from '../types'

interface PipelinesProps {
  pipelines: IPipelineStage[]
}

const Pipelines: FC<PipelinesProps> = ({ pipelines }) => {
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
            pipeline.id === 'rag' || pipeline.id === 'outputs'
              ? () => {} // handleStageEdit(pipeline.id)
              : undefined
          }
          showEditButton={pipeline.id === 'rag' || pipeline.id === 'outputs'}
          editLabel={
            pipeline.id === 'rag'
              ? '번역가 지정'
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
