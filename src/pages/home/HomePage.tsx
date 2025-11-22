import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../../shared/config/routes'
import { useAuthStore } from '../../shared/store/useAuthStore'
import WorkspacePage from '../workspace/WorkspacePage'

import { HomeHeroSection } from './components/HomeHeroSection'
import { HomeAudioComparisonSection, type AudioScript } from './components/HomeAudioComparisonSection'
import { HomeEditorFeaturesSection, type FeatureItem } from './components/HomeEditorFeaturesSection'

// ============================================================================
// [콘텐츠 설정 영역]
// 이 곳의 데이터를 수정하여 메인 페이지의 텍스트, 이미지, 오디오를 변경하세요.
// ============================================================================

const LANDING_CONTENT = {
  // 1. 히어로 섹션 (영상 비교)
  hero: {
    title: (
      <>
        AI 기반 자동 더빙으로 <br className="hidden md:inline" />
        글로벌 콘텐츠를 만드세요
      </>
    ),
    description:
      '원본 영상을 선택한 언어로 자동 더빙하여 전 세계 시청자에게 전달하세요. 자연스러운 음성과 정확한 타이밍의 영상을 만들어 드립니다.',
    videoSrc: '/media/welcom/preview.mp4',
    videoPoster: '', // 썸네일 이미지 경로 (옵션)
    samples: {
      ko: { label: '한국어', audioSrc: '/media/welcom/korean_audio.mp3' },
      en: { label: 'English', audioSrc: '/media/welcom/english_audio.mp3' },
    },
  },

  // 2. 오디오 비교 섹션
  audioComparison: {
    title: '다양한 AI 보이스를 경험해보세요',
    description: '텍스트만 입력하면, 감정이 담긴 자연스러운 목소리로 변환해드립니다.',
    scripts: [
      {
        language: 'ko',
        label: '한국어',
        text: '안녕하세요! 저희 AI 더빙 서비스를 이용해주셔서 감사합니다. 정말 자연스럽지 않나요?',
        speakers: [
          {
            id: 'ko-1',
            name: '민지',
            language: 'ko',
            avatarColor: '#FF6B6B',
            audioSrc: '/media/welcom/korean_audio.mp3', // 실제 화자별 오디오 파일로 교체 필요
          },
          {
            id: 'ko-2',
            name: '준호',
            language: 'ko',
            avatarColor: '#4ECDC4',
            audioSrc: '/media/welcom/korean_audio.mp3',
          },
          {
            id: 'ko-3',
            name: '서연',
            language: 'ko',
            avatarColor: '#FFE66D',
            audioSrc: '/media/welcom/korean_audio.mp3',
          },
        ],
      },
      {
        language: 'en',
        label: 'English',
        text: 'Hello! Thank you for using our AI dubbing service. Doesnt it sound incredibly natural?',
        speakers: [
          {
            id: 'en-1',
            name: 'Sarah',
            language: 'en',
            avatarColor: '#1A535C',
            audioSrc: '/media/welcom/english_audio.mp3',
          },
          {
            id: 'en-2',
            name: 'James',
            language: 'en',
            avatarColor: '#FF6B6B',
            audioSrc: '/media/welcom/english_audio.mp3',
          },
        ],
      },
      {
        language: 'ja',
        label: '日本語',
        text: 'こんにちは！AI吹き替えサービスをご利用いただきありがとうございます。とても自然に聞こえませんか？',
        speakers: [
          {
            id: 'ja-1',
            name: 'Sakura',
            language: 'ja',
            avatarColor: '#FF9F1C',
            audioSrc: '/media/welcom/korean_audio.mp3', // 임시 경로
          },
        ],
      },
    ] as AudioScript[],
  },

  // 3. 에디터 기능 소개 섹션
  features: {
    title: '강력한 웹 에디터',
    description: '복잡한 설치 없이 웹에서 바로 수정하고 완성하세요',
    items: [
      {
        title: '보컬 트랙 변경',
        description:
          '마음에 들지 않는 목소리가 있나요?\n클릭 한 번으로 다른 성우의 목소리로 변경할 수 있습니다',
        mediaType: 'image', // 영상이 준비되면 'video'로 변경
        mediaSrc: 'https://placehold.co/600x400/e2e8f0/475569?text=Vocal+Track+Change', // 데모 이미지/영상 경로
      },
      {
        title: '재번역 및 재TTS',
        description:
          '번역이 어색하다면 텍스트를 직접 수정하세요\n수정된 텍스트에 맞춰 AI가 즉시 새로운 음성을 생성합니다',
        mediaType: 'image',
        mediaSrc: 'https://placehold.co/600x400/e2e8f0/475569?text=Re-translation',
      },
      {
        title: '보이스 라이브러리',
        description:
          '수백 가지의 다양한 AI 보이스 중\n내 콘텐츠에 딱 맞는 목소리를 찾아보세요\n즐겨찾기에 추가하여 언제든 사용할 수 있습니다',
        mediaType: 'image',
        mediaSrc: 'https://placehold.co/600x400/e2e8f0/475569?text=Voice+Library',
      },
    ] as FeatureItem[],
  },
}

// ============================================================================

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  // 인증 시 워크스페이스로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.workspace, { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return <WorkspacePage />
  }

  return (
    <div className="flex flex-col gap-16 pb-16 pt-8">
      {/* 1. Hero Section (Video Comparison) */}
      <div className="mx-auto w-full max-w-7xl px-6">
        <HomeHeroSection
          title={LANDING_CONTENT.hero.title}
          description={LANDING_CONTENT.hero.description}
          videoSrc={LANDING_CONTENT.hero.videoSrc}
          videoPoster={LANDING_CONTENT.hero.videoPoster}
          samples={LANDING_CONTENT.hero.samples}
        />
      </div>

      {/* 2. Audio Comparison Section */}
      <HomeAudioComparisonSection
        title={LANDING_CONTENT.audioComparison.title}
        description={LANDING_CONTENT.audioComparison.description}
        scripts={LANDING_CONTENT.audioComparison.scripts}
      />

      {/* 3. Editor Features Section */}
      <HomeEditorFeaturesSection
        title={LANDING_CONTENT.features.title}
        description={LANDING_CONTENT.features.description}
        features={LANDING_CONTENT.features.items}
      />
    </div>
  )
}
