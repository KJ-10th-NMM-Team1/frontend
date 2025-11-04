export interface CreateTranslatorFormValues {
  name: string
  email: string
  languages: string
  status: 'active' | 'inactive'
}

export interface CreateTranslatorPayload {
  name: string
  email?: string
  languages: string[] // 서버에는 배열로 넘깁니다.
  status: 'active' | 'inactive'
}
