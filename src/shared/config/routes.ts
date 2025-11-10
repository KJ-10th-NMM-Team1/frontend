export const routes = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  workspace: '/workspace',
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,
  editor: (id: string) => `/editor/${id}`,
}

export const workspaceModals = {
  createStep: 'create',
}
