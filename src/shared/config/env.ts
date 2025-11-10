const metaEnv = import.meta.env

const fallbackAppName = 'Front Wireframe'

export const env = {
  appName: metaEnv.VITE_APP_NAME ?? fallbackAppName,
  apiBaseUrl: metaEnv.VITE_API_BASE_URL ?? '/api',
  enableMocking: (metaEnv.VITE_ENABLE_MSW ?? 'true') === 'true',
  environment: metaEnv.MODE ?? 'development',
  awsS3Bucket: metaEnv.VITE_AWS_S3_BUCKET ?? 'dupilot-dev-media',
  awsRegion: metaEnv.VITE_AWS_REGION ?? 'ap-northeast-2',
}

export const isDevelopment = env.environment === 'development'
