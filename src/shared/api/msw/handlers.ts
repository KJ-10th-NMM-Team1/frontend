import { HttpResponse, http, passthrough } from 'msw'

import type { ExampleItem, ExampleItemPayload } from '../../../entities/example/types'
import { sampleGlossaries } from '../../../entities/glossary/types'
import { sampleLanguages } from '../../../entities/language/types'
import { sampleProjects } from '../../../entities/project/types'
import { sampleSegments } from '../../../entities/segment/types'
import { sampleVoices } from '../../../entities/voice-sample/types'

let exampleItems: ExampleItem[] = [
  {
    id: 'example-1',
    name: 'Sample Onboarding Flow',
    owner: 'Evelyn',
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example-2',
    name: 'Dubbing Guide Documentation',
    owner: 'Marcus',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockUser = {
  id: 'jjy3386',
  email: 'jjy3386@gmail.com',
  name: '진주영',
  roles: ['editor'],
}

export const handlers = [
  http.get('/api/storage/media/:key*', () => passthrough()),

  http.get('/api/projects', () => {
    const items = sampleProjects.map((project) => ({
      id: project.id,
      title: project.title,
      source_language: project.source_language,
      status: project.status,
      dueDate: project.dueDate,
      assignedEditor: project.assignedEditor,
      createdAt: project.createdAt,
      thumbnail: project.thumbnail,
      duration_seconds: project.duration_seconds,
      targets: project.targets,
    }))

    return HttpResponse.json({ items })
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = sampleProjects.find((item) => item.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  http.get('/api/projects/:id/languages/:lang', ({ params }) => {
    const project = sampleProjects.find((item) => item.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: 'Editor state not found' }, { status: 404 })
    }

    return HttpResponse.json({
      projectId: project.id,
      segments: sampleSegments,
      voices: sampleVoices,
      glossaries: sampleGlossaries,
      playback: {
        duration: project.assets.at(0)?.duration ?? 0,
        playbackRate: 1,
      },
    })
  }),

  http.get('/api/example-items', () => {
    return HttpResponse.json({ items: exampleItems })
  }),

  http.post('/api/example-items', async ({ request }) => {
    const payload = (await request.json()) as ExampleItemPayload
    const now = new Date().toISOString()
    const created: ExampleItem = {
      id: `example-${Date.now()}`,
      name: payload.name,
      owner: payload.owner,
      status: payload.status,
      createdAt: now,
      updatedAt: now,
    }
    exampleItems = [created, ...exampleItems]
    return HttpResponse.json({ item: created }, { status: 201 })
  }),

  http.patch('/api/example-items/:id', async ({ params, request }) => {
    const id = params.id as string
    const payload = (await request.json()) as ExampleItemPayload
    const index = exampleItems.findIndex((item) => item.id === id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const updated: ExampleItem = {
      ...exampleItems[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    }
    exampleItems[index] = updated
    return HttpResponse.json({ item: updated })
  }),

  http.delete('/api/example-items/:id', ({ params }) => {
    const id = params.id as string
    exampleItems = exampleItems.filter((item) => item.id !== id)
    return HttpResponse.json({ success: true })
  }),

  // http.get('/api/languages', () => {
  //   return HttpResponse.json({ items: sampleLanguages })
  // }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email !== 'jjy3386@gmail.com' || body.password !== 'password') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: mockUser,
    })
  }),

  http.get('/api/users/me', () => {
    // 필요하다면 Authorization 헤더 검증 로직 추가 가능
    return HttpResponse.json({
      user: mockUser,
    })
  }),
]
