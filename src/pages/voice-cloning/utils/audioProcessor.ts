/**
 * Creates a processed audio stream with noise reduction filters
 * Applies highpass, lowpass, and compression filters to improve voice quality
 */
export function createProcessedStream(stream: MediaStream): {
  processedStream: MediaStream
  audioContext: AudioContext
} {
  const audioContext = new AudioContext()
  const source = audioContext.createMediaStreamSource(stream)

  // High-pass filter to remove low-frequency noise
  const highpass = audioContext.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 80

  // Low-pass filter to remove high-frequency noise
  const lowpass = audioContext.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 8000

  // Dynamic compression to normalize volume
  const compressor = audioContext.createDynamicsCompressor()
  compressor.threshold.value = -30
  compressor.ratio.value = 12

  const destination = audioContext.createMediaStreamDestination()

  // Connect audio processing chain
  source.connect(highpass)
  highpass.connect(lowpass)
  lowpass.connect(compressor)
  compressor.connect(destination)

  return {
    processedStream: destination.stream,
    audioContext,
  }
}

/**
 * Checks if browser supports audio recording
 */
export function supportsRecording(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}
