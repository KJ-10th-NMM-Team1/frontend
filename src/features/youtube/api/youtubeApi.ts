import { apiClient } from '@/shared/api/client'

type ApiConnectionInfo = {
  connected: boolean
  channel_title?: string | null
  channel_id?: string | null
  channel_thumbnail?: string | null
  updated_at?: string | null
}

export type YoutubeConnectionInfo = {
  connected: boolean
  channelTitle?: string
  channelId?: string
  channelThumbnail?: string
  updatedAt?: string
}

type YoutubeOAuthStartResponse = {
  auth_url: string
  state: string
  expires_at: string
}

export type YoutubePublishPayload = {
  projectId: string
  assetId: string
  languageCode: string
  title: string
  description?: string
  privacyStatus?: 'private' | 'unlisted' | 'public'
  tags?: string[]
}

type ApiPublishPayload = {
  project_id: string
  asset_id: string
  language_code: string
  title: string
  description?: string
  privacy_status?: string
  tags?: string[]
}

type ApiPublishResponse = {
  video_id: string
  channel_id?: string | null
  published_at: string
  title: string
}

export type YoutubePublishResponse = {
  videoId: string
  channelId?: string
  publishedAt: string
  title: string
}

export function mapYoutubeConnectionInfo(info: ApiConnectionInfo): YoutubeConnectionInfo {
  return {
    connected: info.connected,
    channelTitle: info.channel_title ?? undefined,
    channelId: info.channel_id ?? undefined,
    channelThumbnail: info.channel_thumbnail ?? undefined,
    updatedAt: info.updated_at ?? undefined,
  }
}

export async function fetchYoutubeStatus(): Promise<YoutubeConnectionInfo> {
  const data = await apiClient.get('api/youtube/status').json<ApiConnectionInfo>()
  return mapYoutubeConnectionInfo(data)
}

export async function startYoutubeOAuth(): Promise<YoutubeOAuthStartResponse> {
  return apiClient.post('api/youtube/oauth/start').json<YoutubeOAuthStartResponse>()
}

export async function completeYoutubeOAuth(payload: {
  code: string
  state: string
}): Promise<YoutubeConnectionInfo> {
  const data = await apiClient
    .post('api/youtube/oauth/callback', { json: payload })
    .json<ApiConnectionInfo>()
  return mapYoutubeConnectionInfo(data)
}

export async function disconnectYoutube(): Promise<void> {
  await apiClient.delete('api/youtube/connection')
}

export async function publishYoutubeVideo(
  payload: YoutubePublishPayload,
): Promise<YoutubePublishResponse> {
  const body: ApiPublishPayload = {
    project_id: payload.projectId,
    asset_id: payload.assetId,
    language_code: payload.languageCode,
    title: payload.title,
    description: payload.description,
    privacy_status: payload.privacyStatus ?? 'unlisted',
    tags: payload.tags,
  }
  const data = await apiClient.post('api/youtube/publish', { json: body }).json<ApiPublishResponse>()
  return {
    videoId: data.video_id,
    channelId: data.channel_id ?? undefined,
    publishedAt: data.published_at,
    title: data.title,
  }
}
