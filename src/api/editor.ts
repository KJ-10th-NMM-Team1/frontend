// frontend/src/api/editor.ts
export type PreviewStatus = 'pending' | 'processing' | 'completed' | 'failed'

type PreviewCreateResponse = {
  previewId?: string
  preview_id?: string
  id?: string
  jobId?: string
  job_id?: string
  status?: string
  videoUrl?: string
  video_url?: string
  audioUrl?: string
  audio_url?: string
  updatedAt?: string
  updated_at?: string
}

type PreviewGetResponse = {
  status?: string
  videoUrl?: string
  video_url?: string
  audioUrl?: string
  audio_url?: string
  updatedAt?: string
  updated_at?: string
}

const readJson = async <T>(res: Response) => (await res.json()) as T

const normalizeStatus = (s?: string): PreviewStatus => {
  const v = (s ?? '').toLowerCase()
  if (v === 'done' || v === 'completed') return 'completed'
  if (v === 'in_progress' || v === 'queued' || v === 'processing') return 'processing'
  if (v === 'failed') return 'failed'
  return 'processing'
}

const readBodyText = async (res: Response) => {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

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
    `/api/editor/projects/${encodeURIComponent(projectId)}/languages/${encodeURIComponent(
      languageCode
    )}/segments/${encodeURIComponent(segmentId)}/preview`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const msg = await readBodyText(res)
    throw new Error(`Create preview failed: ${res.status} ${msg}`)
  }

  const data = (await res.json()) as PreviewCreateResponse
  return {
    previewId: data.previewId ?? data.preview_id ?? data.id ?? data.jobId ?? data.job_id,
    status: normalizeStatus(data.status),
    videoUrl: data.videoUrl ?? data.video_url,
    audioUrl: data.audioUrl ?? data.audio_url,
    updatedAt: data.updatedAt ?? data.updated_at,
  }
}

export async function getSegmentPreview(
  previewId: string
): Promise<{ status: PreviewStatus; videoUrl?: string; audioUrl?: string; updatedAt?: string }> {
  const res = await fetch(`/api/editor/preview/${encodeURIComponent(previewId)}`, {
    method: 'GET',
  })
  if (!res.ok) {
    const msg = await readBodyText(res)
    throw new Error(`Get preview failed: ${res.status} ${msg}`)
  }

  const data = (await res.json()) as PreviewGetResponse
  return {
    status: normalizeStatus(data.status),
    videoUrl: data.videoUrl ?? data.video_url,
    audioUrl: data.audioUrl ?? data.audio_url,
    updatedAt: data.updatedAt ?? data.updated_at,
  }
}
