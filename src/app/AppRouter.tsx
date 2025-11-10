import { Suspense, lazy } from 'react'

import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'

import { AppFallback } from './providers/AppFallback'
import { RootLayout } from './routes/RootLayout'
import { RouteErrorBoundary } from './routes/RouteErrorBoundary'

const HomePage = lazy(() => import('../pages/home/HomePage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const SignupPage = lazy(() => import('../pages/auth/SignupPage'))
const WorkspacePage = lazy(() => import('../pages/workspace/WorkspacePage'))
const ProjectsListPage = lazy(() => import('../pages/projects/ProjectsListPage'))
const ProjectDetailPage = lazy(() => import('../pages/projects/ProjectDetailPage'))
const EditorPage = lazy(() => import('../pages/editor/EditorPage'))
const ExampleCrudPage = lazy(() => import('../pages/example/ExampleCrudPage'))
const ModalExamplePage = lazy(() => import('../pages/example/ModalExamplePage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<RouteErrorBoundary />}>
      <Route index element={<HomePage />} />
      <Route path="auth">
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
      <Route path="workspace" element={<WorkspacePage />} />
      <Route path="projects">
        <Route index element={<ProjectsListPage />} />
        <Route path=":id" element={<ProjectDetailPage />} />
      </Route>
      <Route path="editor/:id" element={<EditorPage />} />
      <Route path="example" element={<ExampleCrudPage />} />
      <Route path="example/modal" element={<ModalExamplePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
)

export function AppRouter() {
  return (
    <Suspense fallback={<AppFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
