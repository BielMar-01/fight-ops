import { afterEach, describe, expect, it } from 'vitest'

import { buildApp } from '../application.js'

describe('GET /health', () => {
  const apps: ReturnType<typeof buildApp>[] = []

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()))
    apps.length = 0
  })

  it('should return the API health status', async () => {
    const app = buildApp()

    apps.push(app)

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)

    expect(response.json()).toEqual({
      status: 'ok',
      service: 'fightops-api',
    })
  })
})