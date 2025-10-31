// export interface LanguageOption {
//   code: string
//   name: string
// }
// export interface CreateProjectLanguage extends LanguageOption {
//   subtitle: boolean
//   dubbing: boolean
// }

export interface CreateProjectFormValues {
  videoFile: File | null
}

export interface CreateProjectPayload {
  videoFile: File
}
