/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MSW?: string
  readonly VITE_AWS_S3_BUCKET?: string
  readonly VITE_AWS_REGION?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_YT_CLIENT_ID?: string
  readonly VITE_GOOGLE_YT_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
