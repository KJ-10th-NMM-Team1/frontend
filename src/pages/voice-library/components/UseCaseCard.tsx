import { ArrowRight } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface UseCaseCardProps {
  title: string
  description?: string
  gradient?: string
  imageUrl?: string
  category?: string
  onClick?: (category: string) => void
}

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=800'

export function UseCaseCard({
  title,
  description,
  gradient,
  imageUrl,
  category,
  onClick,
}: UseCaseCardProps) {
  const handleClick = () => {
    if (category && onClick) {
      onClick(category)
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative flex h-36 overflow-hidden rounded-[22px] text-left',
        // ElevenLabs 카드 배경 느낌
        gradient ? `bg-gradient-to-br ${gradient}` : 'bg-[#e2e5f0]',
        'shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-lg',
      )}
    >
      {/* ── 왼쪽: 떠 있는 이미지 카드 + 뒤 그림자 카드 ── */}
      <div className="relative flex h-full w-[48%] items-center">
        {/* 실제 이미지 카드 */}
        <div className="relative z-10 ml-[5%] mt-[1%] h-[95%] w-[95%] overflow-hidden rounded-[18px] bg-black/30">
          <img
            src={imageUrl || FALLBACK_IMAGE}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* ── 오른쪽: 텍스트 영역 ── */}
      <div className="relative flex flex-1 flex-col justify-center px-4 pr-10">
        <div className="text-sm font-semibold leading-snug text-slate-900">{title}</div>
        {description && <p className="mt-1 line-clamp-2 text-xs text-slate-600">{description}</p>}
      </div>

      {/* 오른쪽 어두운 웨지 느낌 */}
      <div className="from-black/18 pointer-events-none absolute inset-y-3 right-9 w-12 rounded-l-3xl bg-gradient-to-l to-transparent" />

      {/* 오른쪽 아래 동그란 화살표 버튼 */}
      <div className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  )
}
