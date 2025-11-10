import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppRouter } from '../app/AppRouter'
import { AppProviders } from '../app/providers/AppProviders'

describe('AppRouter', () => {
  it('renders home page hero copy', async () => {
    render(
      <AppProviders>
        <AppRouter />
      </AppProviders>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /AI 기반 자동 더빙으로 글로벌 콘텐츠를 만드세요/i,
      }),
    ).toBeInTheDocument()
  })
})
