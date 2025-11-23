import ReactCountryFlag from 'react-country-flag'
import { cn } from '@/shared/lib/utils'
import { VOICE_CATEGORY_MAP } from '@/shared/constants/voiceCategories'

const COUNTRY_DISPLAY_MAP: Record<string, { code: string; label: string }> = {
  ko: { code: 'KR', label: '한국' },
  kr: { code: 'KR', label: '한국' },
  en: { code: 'US', label: '영어권' },
  us: { code: 'US', label: '미국' },
  uk: { code: 'GB', label: '영국' },
  gb: { code: 'GB', label: '영국' },
  ja: { code: 'JP', label: '일본' },
  jp: { code: 'JP', label: '일본' },
  zh: { code: 'CN', label: '중국' },
  cn: { code: 'CN', label: '중국' },
}

const getCountryCode = (country?: string) => {
  if (!country) return undefined
  const normalized = country.trim().toLowerCase()
  const mapped = COUNTRY_DISPLAY_MAP[normalized]
  if (mapped) return mapped.code
  if (country.length === 2) {
    return country.toUpperCase()
  }
  return undefined
}

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 transition-colors hover:bg-gray-200',
      className,
    )}
  >
    {children}
  </span>
)

const MoreBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500',
      className,
    )}
  >
    {children}
  </span>
)

type VoiceSampleTagsProps = {
  tags: string[]
  country?: string
}

export function VoiceSampleTags({ tags, country }: VoiceSampleTagsProps) {
  if (tags.length === 0) return null

  const countryCode = getCountryCode(country)
  const firstTag = tags[0]
  const isFirstTagLanguage = firstTag === '한국어' || firstTag === '영어'

  return (
    <div className="relative flex shrink-0 items-center gap-1.5">
      {tags.slice(0, 3).map((tag, idx) => {
        if (idx === 0 && isFirstTagLanguage && countryCode) {
          return (
            <Badge key={idx}>
              <span className="mr-1.5 flex items-center">
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{ width: '0.9em', height: '0.9em' }}
                  title={tag}
                />
              </span>
              {tag}
            </Badge>
          )
        }
        const isMetaTag =
          tag === '한국어' ||
          tag === '영어' ||
          (Object.values(VOICE_CATEGORY_MAP) as string[]).includes(tag)
        return <Badge key={idx}>{isMetaTag ? tag : `#${tag}`}</Badge>
      })}

      {tags.length > 3 && (
        <div className="group/tooltip relative">
          <MoreBadge className="cursor-default transition-colors hover:bg-gray-200 hover:text-gray-700">
            +{tags.length - 3}
          </MoreBadge>
          <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-max max-w-[240px] translate-y-1 opacity-0 transition-all duration-200 ease-out group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100">
            <div className="relative rounded-xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5">
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(3).map((tag, idx) => (
                  <Badge key={idx}>#{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
