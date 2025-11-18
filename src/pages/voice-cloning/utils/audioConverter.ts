/**
 * Converts a Blob to WAV format with specified sample rate
 */
export async function convertBlobToWav(blob: Blob, targetSampleRate = 16_000): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new AudioContext()
  let decodedBuffer: AudioBuffer
  try {
    decodedBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
  } catch (error) {
    await audioContext.close().catch(() => {})
    throw error
  }

  let renderedBuffer = decodedBuffer
  if (decodedBuffer.sampleRate !== targetSampleRate) {
    const offlineContext = new OfflineAudioContext(
      decodedBuffer.numberOfChannels,
      Math.max(1, Math.ceil(decodedBuffer.duration * targetSampleRate)),
      targetSampleRate,
    )
    const bufferSource = offlineContext.createBufferSource()
    bufferSource.buffer = decodedBuffer
    bufferSource.connect(offlineContext.destination)
    bufferSource.start(0)
    renderedBuffer = await offlineContext.startRendering()
  }

  const wavArrayBuffer = audioBufferToWav(renderedBuffer)
  await audioContext.close().catch(() => {})
  return new Blob([wavArrayBuffer], { type: 'audio/wav' })
}

/**
 * Converts AudioBuffer to WAV format ArrayBuffer
 */
export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1
  const bitDepth = 16
  const blockAlign = (numChannels * bitDepth) / 8
  const byteRate = sampleRate * blockAlign
  const dataLength = buffer.length * blockAlign
  const bufferLength = 44 + dataLength
  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  const interleaved = interleave(buffer)
  let offset = 44
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    let sample = Math.max(-1, Math.min(1, interleaved[i]))
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    view.setInt16(offset, sample, true)
  }

  return arrayBuffer
}

/**
 * Interleaves audio buffer channels
 */
function interleave(buffer: AudioBuffer): Float32Array {
  const length = buffer.length
  const result = new Float32Array(length * buffer.numberOfChannels)
  let offset = 0
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      result[offset++] = buffer.getChannelData(channel)[i]
    }
  }
  return result
}

/**
 * Writes string to DataView at specified offset
 */
function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
