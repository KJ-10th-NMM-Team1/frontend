import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/Button'

import { UseCaseCard } from '../components/UseCaseCard'

interface UseCaseCarouselSectionProps {
  onCategoryClick?: (category: string) => void
}

export function UseCaseCarouselSection({ onCategoryClick }: UseCaseCarouselSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Handpicked for your use case</h2>
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
          title="Entertainment & TV"
          description="Premium voices crafted for television, streaming, and cinematic productions."
          imageUrl="https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800"
          category="Entertainment & TV"
          onClick={onCategoryClick}
        />
        <UseCaseCard
          title="Narrative & Story"
          description="Immersive storytelling voices that bring narratives to life with depth and emotion."
          imageUrl="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800"
          category="Narrative & Story"
          onClick={onCategoryClick}
        />
        <UseCaseCard
          title="Characters & Animation"
          description="Dynamic character voices designed for animation, gaming, and interactive media."
          imageUrl="https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=800"
          category="Characters & Animation"
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
