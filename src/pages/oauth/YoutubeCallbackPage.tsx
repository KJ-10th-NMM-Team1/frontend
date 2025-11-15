import { useEffect, useMemo, useState } from 'react'

import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useCompleteYoutubeOAuthMutation } from '@/features/youtube/hooks/useYoutubeIntegration'
import { routes } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

type Status = 'loading' | 'success' | 'error'

export default function YoutubeCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutate } = useCompleteYoutubeOAuthMutation()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState<string>('구글 인증을 완료하는 중입니다.')

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  const isProcessing = status === 'loading'

  useEffect(() => {
    if (oauthError) {
      setStatus('error')
      setMessage('Google 인증이 취소되었습니다. 다시 시도해주세요.')
      return
    }
    if (!code || !state) {
      setStatus('error')
      setMessage('필수 인증 정보(code/state)를 찾을 수 없습니다.')
      return
    }

    mutate(
      { code, state },
      {
        onSuccess: () => {
          setStatus('success')
          setMessage('YouTube 계정 연동이 완료되었습니다. 잠시 후 내 정보 페이지로 이동합니다.')
        },
        onError: () => {
          setStatus('error')
          setMessage('인증 토큰을 저장하지 못했습니다. 다시 시도해주세요.')
        },
      },
    )
  }, [code, state, oauthError, mutate])

  useEffect(() => {
    if (status !== 'success') return
    const timer = window.setTimeout(() => {
      navigate(routes.myinfo, { replace: true })
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [status, navigate])

  const title = useMemo(() => {
    if (status === 'success') return 'YouTube 연동 완료'
    if (status === 'error') return 'YouTube 연동 실패'
    return 'YouTube 연동 중'
  }, [status])

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center justify-center px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <p className="text-muted text-sm">잠시만 기다려주세요...</p>
            </div>
          ) : null}
          {status !== 'loading' ? (
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link to={routes.myinfo}>내 정보로 이동</Link>
              </Button>
              {status === 'error' ? (
                <Button asChild>
                  <Link to={routes.myinfo}>다시 시도</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
