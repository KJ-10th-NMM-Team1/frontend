import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Bell, CalendarDays, KeyRound, Mail, PenSquare, Shield, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getCurrentUser, type UserOut } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'

const fallbackUser: UserOut = {
  id: '',
  username: '게스트',
  email: 'unknown@example.com',
  role: 'guest',
  createAt: new Date().toISOString(),
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function MyInfoPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const profile = data ?? fallbackUser

  const initials = useMemo(() => {
    return (
      profile.username
        ?.split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ME'
    )
  }, [profile.username])

  const accountDetails = useMemo(
    () => [
      {
        label: '이메일',
        value: profile.email,
        icon: Mail,
      },
      {
        label: '역할',
        value: profile.role ? profile.role.toUpperCase() : '-',
        icon: Shield,
      },
      {
        label: '가입일',
        value: formatDate(profile.createAt),
        icon: CalendarDays,
      },
    ],
    [profile.email, profile.role, profile.createAt],
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-semibold">내 정보</h1>
          <p className="text-muted mt-1 text-sm">
            계정 정보를 확인하고 알림, 보안 설정을 관리할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
            <PenSquare className="h-4 w-4" />
            프로필 편집
          </Button>
          <Button className="gap-2">
            <KeyRound className="h-4 w-4" />
            비밀번호 변경
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="border-surface-3 bg-surface-1 flex items-center justify-center rounded-3xl border py-20">
          <Spinner size="lg" />
          <span className="text-muted ml-3 text-sm">사용자 정보를 불러오는 중…</span>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="bg-primary/10 text-primary flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold">
                {initials}
              </div>
              <div className="space-y-2">
                <p className="text-muted text-xs font-semibold uppercase tracking-[0.35em]">
                  Profile
                </p>
                <h2 className="text-foreground text-2xl font-semibold">{profile.username}</h2>
                <Badge tone="default" className="text-xs uppercase tracking-wide">
                  {profile.role || 'unassigned'}
                </Badge>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {accountDetails.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border-surface-3 bg-surface-1 flex items-start gap-3 rounded-2xl border p-4"
                >
                  <div className="text-muted flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
                    <p className="text-foreground text-sm font-medium">{value ?? '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>활동 요약</CardTitle>
              <CardDescription>최근 30일 기준 사용량 지표입니다.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {[
                { label: '생성한 프로젝트', value: '12', icon: UserRound },
                { label: '업로드 진행 중', value: '3', icon: PenSquare },
                { label: '알림 수신', value: '8', icon: Bell },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="border-surface-3 bg-surface-1 flex items-center gap-3 rounded-2xl border px-4 py-3"
                >
                  <div className="text-primary bg-primary/10 flex h-10 w-10 items-center justify-center rounded-2xl">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
                      <p className="text-foreground text-xl font-semibold">{value}</p>
                    </div>
                    <Badge tone="default" className="text-xs">
                      최근 30일
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>계정 보안</CardTitle>
              <CardDescription>계정을 안전하게 보호하기 위한 권장 설정입니다.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="border-surface-3 rounded-2xl border px-4 py-3">
                <p className="text-foreground font-medium">다중 인증</p>
                <p className="text-muted text-sm">추가 인증 수단을 설정하면 보안이 강화됩니다.</p>
                <Button variant="ghost" size="sm" className="text-primary mt-3 px-0">
                  설정하기
                </Button>
              </div>
              <div className="border-surface-3 rounded-2xl border px-4 py-3">
                <p className="text-foreground font-medium">최근 로그인 기록</p>
                <p className="text-muted text-sm">새로운 기기에서 접속 시 이메일로 알려드립니다.</p>
                <Button variant="ghost" size="sm" className="text-primary mt-3 px-0">
                  기록 확인
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
