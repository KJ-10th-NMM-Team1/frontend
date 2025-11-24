export const VOICE_CATEGORY_MAP = {
  narrative: '내레이션/스토리',
  character: '캐릭터/애니메이션',
  entertainment: '엔터테인먼트/TV',
  informative: '정보/교육',
  advertisement: '광고',
  conversation: '대화형',
  social: '소셜 미디어',
} as const

export type VoiceCategoryCode = keyof typeof VOICE_CATEGORY_MAP
export const VOICE_CATEGORY_CODES = Object.keys(VOICE_CATEGORY_MAP) as VoiceCategoryCode[]
export const VOICE_CATEGORIES = VOICE_CATEGORY_CODES.map((code) => ({
  code,
  label: VOICE_CATEGORY_MAP[code],
}))
