import { StrictMode } from 'react'

import ReactDOM from 'react-dom/client'

import { AppRouter } from './app/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import './shared/styles/tailwind.css'

async function enableMocks() {
  if (import.meta.env.DEV) {
    const { initMockServer } = await import('./shared/api/msw/browser')
    await initMockServer()
  }
}

async function bootstrap() {
  await enableMocks()

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
      ,
    </StrictMode>,
  )
}

void bootstrap()
