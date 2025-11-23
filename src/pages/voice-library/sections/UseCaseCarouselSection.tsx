import { useEffect, useMemo, useState } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { VOICE_CATEGORIES } from '@/shared/constants/voiceCategories'

import { UseCaseCard } from '../components/UseCaseCard'

interface UseCaseCarouselSectionProps {
  onCategoryClick?: (category: string) => void
}

export function UseCaseCarouselSection({ onCategoryClick }: UseCaseCarouselSectionProps) {
  const [startIndex, setStartIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(4)

  const imageMap: Record<string, string> = {
    narrative:
      'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=800',
    conversation:
      'https://images.pexels.com/photos/1181356/pexels-photo-1181356.jpeg?auto=compress&cs=tinysrgb&w=800',
    character:
      'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=800',
    social:
      'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    entertainment:
      'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
    advertisement:
      'https://images.pexels.com/photos/266176/pexels-photo-266176.jpeg?auto=compress&cs=tinysrgb&w=800',
    informative:
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
  }

  const descriptionMap: Record<string, string> = {
    narrative: '깊이 있는 스토리텔링과 따뜻한 내레이션으로 몰입감을 높여요.',
    conversation: '대화형 챗봇과 콜센터에 어울리는 자연스러운 톤과 템포.',
    character: '게임·애니메이션 속 캐릭터를 생생히 살리는 개성 있는 목소리.',
    social: '쇼츠·릴스·틱톡에서 돋보이는 발랄하고 리드미컬한 음색.',
    entertainment: '방송·예능·라이브 스트리밍에 맞는 에너지 넘치는 목소리.',
    advertisement: '광고 카피를 선명하게 전달하는 설득력 있는 톤.',
    informative: '교육·가이드 영상용으로 깔끔하고 또렷한 설명형 목소리.',
  }

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setCardsPerView(4)
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        setCardsPerView(2)
      } else {
        setCardsPerView(1)
      }
    }
    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  const sliderItems = useMemo(() => {
    if (VOICE_CATEGORIES.length === 0) return []
    const buffer = VOICE_CATEGORIES.slice(0, cardsPerView)
    return [...VOICE_CATEGORIES, ...buffer]
  }, [cardsPerView])

  const handlePrev = () => {
    if (VOICE_CATEGORIES.length === 0) return
    setStartIndex((prev) => {
      const next = prev - 1
      return next < 0 ? VOICE_CATEGORIES.length - 1 : next
    })
  }

  const handleNext = () => {
    if (VOICE_CATEGORIES.length === 0) return
    setStartIndex((prev) => (prev + 1) % VOICE_CATEGORIES.length)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">카테고리별 목소리 모음</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:border-outline h-9 w-9 rounded-full text-foreground hover:bg-surface-2"
            onClick={handlePrev}
            disabled={VOICE_CATEGORIES.length <= cardsPerView}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:border-outline h-9 w-9 rounded-full text-foreground hover:bg-surface-2"
            onClick={handleNext}
            disabled={VOICE_CATEGORIES.length <= cardsPerView}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(startIndex * 100) / cardsPerView}%)`,
          }}
        >
          {sliderItems.map((category, idx) => (
            <div
              key={`${category.code}-${idx}`}
              className="flex-shrink-0"
              style={{ width: `${100 / cardsPerView}%` }}
            >
              <UseCaseCard
                title={category.label}
                description={descriptionMap[category.code] ?? '다양한 활용을 위한 맞춤 목소리.'}
                imageUrl={imageMap[category.code]}
                category={category.code}
                onClick={onCategoryClick}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
