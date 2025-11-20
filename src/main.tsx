import { StrictMode } from 'react'

import ReactDOM from 'react-dom/client'

import { AppRouter } from './app/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import './shared/styles/tailwind.css'
// import { useProjects } from './features/projects/hooks/useProjects'
// import { PipelineStatusListener } from './features/projects/hooks/usePipelineStatusListener'

async function enableMocks() {
  if (import.meta.env.DEV) {
    const { initMockServer } = await import('./shared/api/msw/browser')
    await initMockServer()
  }
}

// function PipelineStatusManager() {
//   const { data: projects = [] } = useProjects() // 혹은 SSE를 구독할 프로젝트 ID 목록
//   return (
//     <>
//       {projects.map((project) => (
//         <PipelineStatusListener key={project.id} project={project} />
//       ))}
//     </>
//   )
// }

async function bootstrap() {
  await enableMocks()

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        {/* <PipelineStatusManager /> */}
        <AppRouter />
      </AppProviders>
      ,
    </StrictMode>,
  )
}

void bootstrap()
