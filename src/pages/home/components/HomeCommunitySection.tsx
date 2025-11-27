// HomeCommunitySection.tsx
import { useState } from 'react'

import { Github } from 'lucide-react'

import { MorphingBackground } from './MorphingBackground'

interface HomeCommunitySectionProps {
  title: string
  description: string
  githubUrl: string
}

export function HomeCommunitySection({ title, description, githubUrl }: HomeCommunitySectionProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent py-24 lg:py-32">
      {/* 1. 배경용 흰색 레이어 (파티클보다 더 뒤로 보냄) */}
      <div className="absolute inset-0 -z-20 bg-white" />

      {/* 2. 파티클 (z-index: -10 이므로 흰 배경보다 앞에 옴) */}
      <MorphingBackground isHovered={isHovered} />

      {/* 3. 컨텐츠 (z-index: 10) */}
      <div className="relative z-10 mx-auto max-w-7xl translate-y-10 px-6 lg:translate-y-14">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-gray-500">{description}</p>
        </div>

        <div className="flex justify-center">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // 접근성을 위한 포커스 이벤트 추가
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            className="group relative flex w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/50"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 transition-colors duration-300 group-hover:bg-black group-hover:text-white">
              <Github className="h-8 w-8" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-900">KJ-10th-NMM-Team1</h3>
            <p className="mb-8 text-gray-500">
              영상의 말투·감정·타이밍을 유지한 채<br /> 여러 언어로 자연스럽게 재해석해주는
              <br /> AI 기반 더빙 플랫폼입니다
            </p>

            <div className="mt-auto flex items-center text-sm font-semibold text-gray-900">
              리포지토리 방문
              <svg
                className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
