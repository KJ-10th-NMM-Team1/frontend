# Segment Operations API

## Usage Examples

### Split Segment

```tsx
import { useSplitSegment } from '@/features/editor/api'
import { useTracksStore } from '@/shared/store/useTracksStore'

function SegmentEditor() {
  const { updateSegment, addSegment } = useTracksStore()

  const { mutate: splitSegment, isPending } = useSplitSegment({
    onSuccess: (data) => {
      // 응답은 [part1, part2] 배열로 직접 옴
      const [part1, part2] = data

      // Update first part (keeps original ID)
      updateSegment(trackId, {
        id: part1.id,
        start: part1.start,
        end: part1.end,
        segment_audio_url: part1.audio_url,
      })

      // Add second part (new segment)
      addSegment(trackId, {
        id: part2.id,
        start: part2.start,
        end: part2.end,
        segment_audio_url: part2.audio_url,
        // ... other segment properties
      })

      toast.success('세그먼트가 분할되었습니다')
    },
    onError: (error) => {
      toast.error(`분할 실패: ${error.message}`)
    },
  })

  const handleSplit = (segmentId: string, splitTime: number) => {
    splitSegment({
      segment_id: segmentId,
      split_time: splitTime,
    })
  }

  return (
    <Button onClick={() => handleSplit('seg-123', 5.5)} disabled={isPending}>
      {isPending ? '분할 중...' : '세그먼트 분할'}
    </Button>
  )
}
```

### Merge Segments

```tsx
import { useMergeSegments } from '@/features/editor/api'
import { useTracksStore } from '@/shared/store/useTracksStore'

function SegmentEditor() {
  const { updateSegment, removeSegment } = useTracksStore()

  const { mutate: mergeSegments, isPending } = useMergeSegments({
    onSuccess: (data, variables) => {
      const merged = data.segment
      const [firstId, ...restIds] = variables.segment_ids

      // Update first segment with merged data
      updateSegment(trackId, {
        id: merged.id,
        start: merged.start,
        end: merged.end,
        segment_audio_url: merged.audio_url,
      })

      // Remove other segments
      restIds.forEach(id => removeSegment(trackId, id))

      toast.success('세그먼트가 병합되었습니다')
    },
    onError: (error) => {
      toast.error(`병합 실패: ${error.message}`)
    },
  })

  const handleMerge = (segmentIds: string[]) => {
    if (segmentIds.length < 2) {
      toast.error('2개 이상의 세그먼트를 선택하세요')
      return
    }

    mergeSegments({
      segment_ids: segmentIds,
    })
  }

  return (
    <Button onClick={() => handleMerge(['seg-123', 'seg-124'])} disabled={isPending}>
      {isPending ? '병합 중...' : '세그먼트 병합'}
    </Button>
  )
}
```

## API Endpoints

### Split Segment
- **POST** `/segments/split`
- **Request**: `{ segment_id: string, split_time: number }`
- **Response**: `[Segment, Segment]` (배열로 직접 반환)

### Merge Segments
- **POST** `/segments/merge`
- **Request**: `{ segment_ids: string[] }`
- **Response**: `{ segment: Segment }`

## Notes

- Split operation keeps the original segment ID for the first part
- Merge operation keeps the first segment's ID
- Both operations return new S3 audio URLs
- Use optimistic updates for better UX if needed
