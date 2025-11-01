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

export interface CreateProjectResponse {
  project_id: string
  upload_url: string
  fields: Record<string, string>
  object_key: string
}

export interface FinUploadPayload {
  project_id: string
  object_key: string
}
