import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { VOICE_CATEGORIES } from '@/shared/constants/voiceCategories'

import { UseCaseCard } from '../components/UseCaseCard'

interface UseCaseCarouselSectionProps {
  onCategoryClick?: (category: string) => void
}

export function UseCaseCarouselSection({ onCategoryClick }: UseCaseCarouselSectionProps) {
  const narration = VOICE_CATEGORIES.find((c) => c.code === 'narrative')
  const character = VOICE_CATEGORIES.find((c) => c.code === 'character')
  const entertainment = VOICE_CATEGORIES.find((c) => c.code === 'entertainment')

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">당신을 위한 목소리 모음</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {/* 일레븐랩스처럼 4개 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <UseCaseCard
          title={entertainment?.label ?? '엔터테인먼트/TV'}
          description="Premium voices crafted for television, streaming, and cinematic productions."
          imageUrl="https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800"
          category={entertainment?.code ?? 'entertainment'}
          onClick={onCategoryClick}
        />
        <UseCaseCard
          title={narration?.label ?? '내레이션/스토리'}
          description="Immersive storytelling voices that bring narratives to life with depth and emotion."
          imageUrl="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800"
          category={narration?.code ?? 'narrative'}
          onClick={onCategoryClick}
        />
        <UseCaseCard
          title={character?.label ?? '캐릭터/애니메이션'}
          description="애니메이션, 게임, 인터랙티브 미디어를 위한 역동적인 캐릭터 보이스."
          imageUrl="https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=800"
          category={character?.code ?? 'character'}
          onClick={onCategoryClick}
        />
        <UseCaseCard
          title="Engaging Characters for Video Games"
          description="Energetic, expressive character performances."
          imageUrl="https://images.pexels.com/photos/907173/pexels-photo-907173.jpeg?auto=compress&cs=tinysrgb&w=800"
        />
      </div>
    </section>
  )
}
