import { ZoomControl } from './ZoomControl'

export function AudioTimelineControls() {
  return (
    <div className="border-outline/20 flex items-center justify-end border-b bg-surface-1 px-3 py-1">
      <ZoomControl />
    </div>
  )
}
