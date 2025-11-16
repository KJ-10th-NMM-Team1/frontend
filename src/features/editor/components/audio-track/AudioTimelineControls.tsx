import { ZoomControl } from './ZoomControl'

export function AudioTimelineControls() {
  return (
    <div className="border-surface-3 flex items-center justify-end border-b px-3 py-1">
      <ZoomControl />
    </div>
  )
}
