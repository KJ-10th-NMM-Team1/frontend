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
  ownerCode: string
}

export interface CreateProjectPayload {
  videoFile: File
  ownerCode: string
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
  ownerCode: string
}

export interface FinishUploadResponse {
  project_id: string
  job_id: string
  status: 'queued'
}
