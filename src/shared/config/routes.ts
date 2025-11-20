export const routes = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  workspace: '/workspace',
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,
  voiceSamples: '/voice-samples',
  voiceCloning: '/voice-cloning',
  voiceLibrary: '/voice-library',
  myinfo: '/myinfo',
  changePassword: '/myinfo/change-password',
  termsOfService: '/policies/terms-of-service',
  prohibitedPolicy: '/policies/prohibited-uses',
  privacyPolicy: '/policies/privacy-policy',
  voiceSampleEdit: (id: string) => `/voice-samples/${id}/edit`,
  youtubeCallback: '/oauth2/callback/youtube',
  editor: (projectId: string, languageCode: string) => `/editor/${projectId}/${languageCode}`,
}

export const workspaceModals = {
  createStep: 'create',
}
