import type { ReactNode } from 'react'

import { WaveBackground } from './WaveBackground'

interface VoiceCloningLayoutProps {
  title: string
  subtitle: string
  description?: string
  step?: 'choose' | 'record-intro' | 'recording' | 'review' | 'details'
  children: ReactNode
}

export function VoiceCloningLayout({
  title,
  subtitle,
  description,
  step,
  children,
}: VoiceCloningLayoutProps) {
  const isSourceStep = step === 'choose'
  const isRecordStep = step === 'record-intro' || step === 'recording' || step === 'review'
  const isDetailsStep = step === 'details'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Animated Background */}
      <WaveBackground />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-600">
              {title}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            {subtitle}
          </h1>
          {description && <p className="mx-auto text-lg text-gray-600">{description}</p>}
        </div>

        {step ? (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium">
            <div className={`flex items-center gap-2 ${isSourceStep ? 'text-primary' : 'text-muted'}`}>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isSourceStep ? 'bg-primary text-white' : 'bg-surface-4 text-muted-foreground'
                }`}
              >
                1
              </span>
              <span>소스 선택</span>
            </div>
            <div className="h-px w-8 bg-surface-4" />
            <div className={`flex items-center gap-2 ${isRecordStep ? 'text-primary' : 'text-muted'}`}>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isRecordStep ? 'bg-primary text-white' : 'bg-surface-4 text-muted-foreground'
                }`}
              >
                2
              </span>
              <span>녹음 / 업로드</span>
            </div>
            <div className="h-px w-8 bg-surface-4" />
            <div className={`flex items-center gap-2 ${isDetailsStep ? 'text-primary' : 'text-muted'}`}>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isDetailsStep ? 'bg-primary text-white' : 'bg-surface-4 text-muted-foreground'
                }`}
              >
                3
              </span>
              <span>정보 입력</span>
            </div>
          </div>
        ) : null}

        {/* Main Card */}
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-purple-100/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
