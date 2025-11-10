export const routes = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  workspace: '/workspace',
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,
  editor: (id: string) => `/editor/${id}`,
  voiceSamples: '/voice-samples',
}

export const workspaceModals = {
  createStep: 'create',
}
