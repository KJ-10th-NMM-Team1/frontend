import { setupWorker } from 'msw/browser'

import { env, isDevelopment } from '../../config/env'

import { handlers } from './handlers'

let worker: ReturnType<typeof setupWorker> | undefined

export async function initMockServer() {
  if (!isDevelopment || !env.enableMocking) {
    return
  }

  if (!worker) {
    worker = setupWorker(...handlers)
  }

  if (worker.listening) {
    return
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}
