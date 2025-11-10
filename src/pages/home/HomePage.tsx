import { useEffect, useState } from 'react'

import { Play } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { routes } from '../../shared/config/routes'
import { trackEvent } from '../../shared/lib/analytics'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { Button } from '../../shared/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card'
import { ToggleGroup, ToggleGroupItem } from '../../shared/ui/ToggleGroup'
import WorkspacePage from '../workspace/WorkspacePage'

type SampleLanguage = 'ko' | 'ja'

const samples: Record<
  SampleLanguage,
  { label: string; caption: string; gradient: string; transcript: string }
> = {
  ko: {
    label: '한국어',
    caption: '자연스러운 한국어 더빙 음성으로 글로벌 온보딩을 돕습니다.',
    gradient: 'from-purple-500 via-blue-500 to-emerald-500',
    transcript: 'AI 파이프라인을 통해 30분 만에 한국어 음성을 합성한 결과입니다.',
  },
  ja: {
    label: '日本語',
    caption: '원문 뉘앙스를 살린 일본어 음성으로 현지화를 빠르게 진행하세요.',
    gradient: 'from-rose-500 via-amber-500 to-violet-500',
    transcript: '현지화 팀이 선호하는 일본어 발음 규칙을 반영해 합성했습니다.',
  },
  // es: {
  //   label: 'Español',
  //   caption: '중남미 시장에서 바로 사용할 수 있는 라틴 스페인어 억양입니다.',
  //   gradient: 'from-cyan-500 via-sky-500 to-green-500',
  //   transcript: '라틴 스페인어 억양을 적용해 글로벌 진출을 돕습니다.',
  // },
}

export default function HomePage() {
  const [language, setLanguage] = useState<SampleLanguage>('ko')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.workspace, { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return <WorkspacePage />
  }

  const activeSample = samples[language]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-16">
      <section className="space-y-10 lg:space-y-14">
        <div className="space-y-6 text-center">
          <h1 className="text-foreground text-balance text-4xl font-semibold leading-tight md:text-5xl">
            AI 기반 자동 더빙으로 <br className="hidden md:inline" />
            글로벌 콘텐츠를 만드세요
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            원본 영상을 선택한 언어로 자동 더빙하여 전 세계 시청자에게 전달하세요. 자연스러운 음성과
            정확한 타이밍의 영상을 만들어 드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => trackEvent('sample_play', { lang: language })}
              className="group px-6"
            >
              <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
              Get started
            </Button>
            <Button asChild variant="outline" size="lg" className="px-6">
              <Link to={routes.login}>Learn more</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          <div className="border-surface-3 bg-surface-1 relative w-full overflow-hidden rounded-3xl border shadow-soft">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${activeSample.gradient} opacity-80`}
            />
            <div className="relative">
              <div className="pb-[56.25%]" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                      Preview Language
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {activeSample.label} 음성 트랙 프리뷰
                    </h2>
                    <p className="mt-1 text-sm text-white/80">{activeSample.caption}</p>
                  </div>
                  <ToggleGroup
                    type="single"
                    value={language}
                    onValueChange={(value) => {
                      if (!value) return
                      setLanguage(value as SampleLanguage)
                      trackEvent('sample_language_toggle', { lang: value })
                    }}
                    className="rounded-full bg-black/30 p-1 backdrop-blur"
                  >
                    {(Object.keys(samples) as SampleLanguage[]).map((code) => (
                      <ToggleGroupItem
                        key={code}
                        value={code}
                        className="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide text-white data-[state=on]:bg-white data-[state=on]:text-black"
                      >
                        {samples[code].label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center">
                  <button
                    type="button"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:scale-105"
                    onClick={() => trackEvent('sample_play', { lang: language })}
                  >
                    <Play className="h-10 w-10 text-white" />
                  </button>
                  <p className="mt-4 text-sm text-white/80">
                    토글을 눌러 언어를 전환하고, 더빙 품질을 바로 확인해보세요.
                  </p>
                </div>
                <div className="rounded-2xl bg-black/35 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Transcript</p>
                  <p className="mt-2 text-sm text-white/90">{activeSample.transcript}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: '배급자 워크플로',
            description:
              '프로젝트 생성부터 배포까지 3단계 모달 플로우로 구성되어 있으며, 업로드/언어/일정 설정을 순차 진행합니다.',
          },
          {
            title: '번역가 에디터',
            description:
              '세그먼트·파형·화자 레인을 동시에 편집하며, 속도 조절·분할·병합으로 싱크를 정밀하게 맞춥니다.',
          },
          {
            title: '완료 리포트',
            description:
              '역할별 권한을 반영한 레포트 화면에서 진행률, 더빙 결과물, 언어별 자산을 확인하고 공유합니다.',
          },
        ].map((item) => (
          <Card key={item.title} className="border-surface-4 bg-surface-1/80 border p-6">
            <CardHeader className="mb-3">
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardDescription className="text-muted text-base leading-relaxed">
              {item.description}
            </CardDescription>
          </Card>
        ))}
      </section>
    </div>
  )
}
