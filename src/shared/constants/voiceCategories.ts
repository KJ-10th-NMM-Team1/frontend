export const VOICE_CATEGORY_MAP = {
  narrative: '내레이션/스토리',
  conversation: '대화형',
  character: '캐릭터/애니메이션',
  social: '소셜 미디어',
  entertainment: '엔터테인먼트/TV',
  advertisement: '광고',
  informative: '정보/교육',
} as const

export type VoiceCategoryCode = keyof typeof VOICE_CATEGORY_MAP
export const VOICE_CATEGORY_CODES = Object.keys(VOICE_CATEGORY_MAP) as VoiceCategoryCode[]
export const VOICE_CATEGORIES = VOICE_CATEGORY_CODES.map((code) => ({
  code,
  label: VOICE_CATEGORY_MAP[code],
}))
