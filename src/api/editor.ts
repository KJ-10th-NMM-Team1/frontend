// frontend/src/api/editor.ts
export type PreviewStatus = 'pending' | 'processing' | 'completed' | 'failed'

export async function createSegmentPreview(
  projectId: string,
  languageCode: string,
  segmentId: string,
  body: { text: string }
): Promise<{
  previewId?: string
  status: PreviewStatus
  videoUrl?: string
  audioUrl?: string
  updatedAt?: string
}> {
  const res = await fetch(
    `/api/editor/projects/${encodeURIComponent(projectId)}/languages/${encodeURIComponent(languageCode)}/segments/${encodeURIComponent(segmentId)}/preview`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Create preview failed: ${res.status} ${msg}`)
  }
  return res.json()
}

export async function getSegmentPreview(
  previewId: string
): Promise<{ status: PreviewStatus; videoUrl?: string; audioUrl?: string; updatedAt?: string }> {
  const res = await fetch(`/api/editor/preview/${encodeURIComponent(previewId)}`, { method: 'GET' })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Get preview failed: ${res.status} ${msg}`)
  }
  return res.json()
}
