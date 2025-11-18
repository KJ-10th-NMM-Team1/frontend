/**
 * Formats seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Validates if a file is an audio file
 */
export function isAudioFile(file: File): boolean {
  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.aac', '.flac', '.ogg']
  const lowerName = file.name.toLowerCase()
  return (
    file.type.startsWith('audio/') || allowedExtensions.some((ext) => lowerName.endsWith(ext))
  )
}
