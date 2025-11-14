/**
 * Audio waveform generation utilities
 */

// Global AudioContext singleton
let audioContext: AudioContext | null = null

/**
 * Get or create global AudioContext
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/**
 * Generates waveform data from an audio URL
 *
 * @param audioUrl - URL of the audio file
 * @param samples - Number of samples to generate (default: 100)
 * @returns Array of amplitude values between 0 and 1
 */
export async function generateWaveformData(
  audioUrl: string,
  samples = 100
): Promise<number[]> {
  const context = getAudioContext()

  try {
    // Fetch audio data
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await context.decodeAudioData(arrayBuffer)

    // Get audio data from the first channel
    const channelData = audioBuffer.getChannelData(0)
    const blockSize = Math.floor(channelData.length / samples)

    const waveformData: number[] = []

    for (let i = 0; i < samples; i++) {
      const start = blockSize * i
      let sum = 0
      let count = 0

      // Calculate RMS (Root Mean Square) for this block
      for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
        const amplitude = channelData[start + j]
        sum += amplitude * amplitude
        count++
      }

      // Calculate RMS and normalize to 0-1
      const rms = Math.sqrt(sum / count)
      waveformData.push(Math.min(1, rms * 2)) // Scale up for visibility
    }

    return waveformData
  } catch (error) {
    console.error('Error generating waveform:', error)
    throw error
  }
}

/**
 * Generates peak waveform data (showing min/max values)
 */
export async function generatePeakWaveformData(
  audioUrl: string,
  samples = 100
): Promise<{ min: number; max: number }[]> {
  const context = getAudioContext()

  try {
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await context.decodeAudioData(arrayBuffer)

    const channelData = audioBuffer.getChannelData(0)
    const blockSize = Math.floor(channelData.length / samples)

    const waveformData: { min: number; max: number }[] = []

    for (let i = 0; i < samples; i++) {
      const start = blockSize * i
      let min = 0
      let max = 0

      for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
        const amplitude = channelData[start + j]
        min = Math.min(min, amplitude)
        max = Math.max(max, amplitude)
      }

      waveformData.push({
        min: Math.abs(min),
        max: Math.abs(max),
      })
    }

    return waveformData
  } catch (error) {
    console.error('Error generating peak waveform:', error)
    throw error
  }
}