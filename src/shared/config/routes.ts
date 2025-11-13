export const routes = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  workspace: '/workspace',
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,
  voiceSamples: '/voice-samples',
  myinfo: '/myinfo',
  changePassword: '/myinfo/change-password',
  editor: (projectId: string, languageCode: string) => `/editor/${projectId}/${languageCode}`,
}

export const workspaceModals = {
  createStep: 'create',
}
