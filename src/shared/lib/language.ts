/**
 * 언어 관련 유틸리티 함수
 */

// 언어 코드를 국기 이모지로 변환
export const getLanguageFlag = (languageCode: string): string => {
  const langToCountry: Record<string, string> = {
    en: 'GB',
    ko: 'KR',
    ja: 'JP',
    zh: 'CN',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    it: 'IT',
    pt: 'PT',
    ru: 'RU',
    ar: 'SA',
    hi: 'IN',
    vi: 'VN',
    th: 'TH',
  }

  const countryCode = langToCountry[languageCode.toLowerCase()] || languageCode.toUpperCase()

  // 국기 이모지 생성: 각 문자를 Regional Indicator Symbol로 변환
  const codePoints = countryCode
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
    .map((code) => String.fromCodePoint(code))
    .join('')

  return codePoints
}

// 언어 코드를 한글 이름으로 변환
export const getLanguageName = (languageCode: string): string => {
  const names: Record<string, string> = {
    en: '영어',
    ko: '한국어',
    ja: '일본어',
    jp: '일본어',
    zh: '중국어',
    es: '스페인어',
    fr: '프랑스어',
    de: '독일어',
    it: '이탈리아어',
    pt: '포르투갈어',
    ru: '러시아어',
    ar: '아랍어',
    hi: '힌디어',
    vi: '베트남어',
    th: '태국어',
  }

  return names[languageCode.toLowerCase()] || languageCode
}
