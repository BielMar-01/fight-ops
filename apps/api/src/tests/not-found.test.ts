import { afterEach, describe, expect, it } from 'vitest'

import { buildApp } from '../application.js'

describe('Not Found', () => {
  const apps: ReturnType<typeof buildApp>[] = []

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()))
    apps.length = 0
  })

  it('should return the standard error response for an unknown route', async () => {
    const app = buildApp()

    apps.push(app)

    const response = await app.inject({
      method: 'GET',
      url: '/unknown-route',
    })

    expect(response.statusCode).toBe(404)

    expect(response.json()).toEqual({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Rota não encontrada.',
      },
    })
  })
})