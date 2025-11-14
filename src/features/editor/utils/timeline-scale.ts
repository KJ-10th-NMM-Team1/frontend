/**
 * Calculate pixels per second based on video duration
 * Designed to show entire video at minimum scale (0.1) and reasonable detail at max scale
 */
export function getPixelsPerSecond(duration: number): number {
  // Viewport width assumption (timeline area width)
  const viewportWidth = 1200

  // Calculate PPS needed to fit entire video in viewport at scale=0.1
  // This ensures the entire video is visible when fully zoomed out
  const fitAllPPS = viewportWidth / (duration * 0.1)

  // Cap maximum PPS to 60-70% of original (was 300, now max 180)
  const cappedMaxPPS = 180

  // Use the smaller of the two to ensure video always fits at min scale
  const basePPS = Math.min(fitAllPPS, cappedMaxPPS)

  // For short videos, reduce the PPS to avoid excessive zoom
  if (duration <= 30) {
    // Very short videos: use 80% of base to reduce zoom range
    return Math.round(basePPS * 0.8)
  } else if (duration <= 60) {
    // Medium videos: use 60% of base
    return Math.round(basePPS * 0.6)
  } else if (duration <= 180) {
    // Longer videos: use 40% of base
    return Math.round(basePPS * 0.4)
  } else {
    // Very long videos: use 30% of base
    return Math.round(Math.max(basePPS * 0.3, 30))
  }
}

/**
 * Calculate timeline width
 */
export function getTimelineWidth(duration: number, scale: number): number {
  return duration * getPixelsPerSecond(duration) * scale
}

/**
 * Convert pixel position to time
 */
export function pixelToTime(pixelPosition: number, duration: number, scale: number): number {
  const pixelsPerSecond = getPixelsPerSecond(duration)
  return pixelPosition / (pixelsPerSecond * scale)
}

/**
 * Convert time to pixel position
 */
export function timeToPixel(time: number, duration: number, scale: number): number {
  const pixelsPerSecond = getPixelsPerSecond(duration)
  return time * pixelsPerSecond * scale
}
