import { useMemo } from 'react'

import { Youtube } from 'lucide-react'

import {
  useDisconnectYoutubeMutation,
  useStartYoutubeOAuthMutation,
  useYoutubeStatus,
} from '@/features/youtube/hooks/useYoutubeIntegration'
import { routes } from '@/shared/config/routes'
import { useUiStore } from '@/shared/store/useUiStore'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

export function YoutubeIntegrationCard() {
  const { data, isLoading, isError } = useYoutubeStatus(true)
  const startMutation = useStartYoutubeOAuthMutation()
  const disconnectMutation = useDisconnectYoutubeMutation()
  const showToast = useUiStore((state) => state.showToast)

  const channel = data?.connected ? data : null
  const isConnecting = startMutation.isPending
  const isDisconnecting = disconnectMutation.isPending

  const lastSyncedLabel = useMemo(() => {
    if (!channel?.updatedAt) return '연동 확인 필요'
    try {
      return new Date(channel.updatedAt).toLocaleString()
    } catch {
      return channel.updatedAt
    }
  }, [channel?.updatedAt])

  const handleConnect = () => {
    startMutation.mutate(undefined, {
      onSuccess: (response) => {
        window.location.href = response.auth_url
      },
      onError: () => {
        showToast({
          title: '유튜브 연동 실패',
          description: 'Google 인증 페이지로 이동하지 못했습니다. 잠시 후 다시 시도해주세요.',
        })
      },
    })
  }

  const handleDisconnect = () => {
    if (!window.confirm('YouTube 연결을 해제하시겠습니까?')) return
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        showToast({
          title: '유튜브 연결 해제 완료',
          description: '언제든지 다시 연동할 수 있습니다.',
        })
      },
      onError: () => {
        showToast({
          title: '연결 해제 실패',
          description: '잠시 후 다시 시도해주세요.',
        })
      },
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-red-100 text-red-600 flex h-12 w-12 items-center justify-center rounded-2xl">
          <Youtube className="h-6 w-6" />
        </div>
        <div>
          <CardTitle>YouTube 연동</CardTitle>
          <CardDescription>영상 배포를 위해 Google 계정을 연결하세요.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-muted flex items-center gap-3 text-sm">
            <Spinner size="sm" />
            YouTube 계정 정보를 불러오는 중...
          </div>
        ) : isError ? (
          <p className="text-destructive text-sm">YouTube 연동 상태를 가져오지 못했습니다.</p>
        ) : channel ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {channel.channelThumbnail ? (
                <img
                  src={channel.channelThumbnail}
                  alt={channel.channelTitle ?? 'YouTube Channel'}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="bg-surface-2 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold">
                  {channel.channelTitle?.slice(0, 2) ?? 'YT'}
                </div>
              )}
              <div>
                <p className="text-foreground font-medium">{channel.channelTitle}</p>
                <p className="text-muted text-xs">마지막 동기화: {lastSyncedLabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="text-xs"
                asChild
                disabled={!channel.channelId}
              >
                <a
                  href={
                    channel.channelId
                      ? `https://studio.youtube.com/channel/${channel.channelId}/videos/upload`
                      : routes.myinfo
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Studio 열기
                </a>
              </Button>
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                연결 해제
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-foreground font-medium">연결되지 않음</p>
              <p className="text-muted text-sm">
                한 번만 연결하면 개인 스튜디오로 바로 배포할 수 있어요.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? '연결 중...' : '유튜브 연동하기'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
