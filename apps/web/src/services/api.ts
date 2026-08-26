import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../auth/auth-token'

import {
  notifySessionExpired,
} from '../auth/auth-session-events'

const localApiUrl =
  'http://localhost:3333'

const configuredApiUrl =
  import.meta.env.VITE_API_URL

const apiUrl =
  import.meta.env.DEV
    ? localApiUrl
    : configuredApiUrl

if (!apiUrl) {
  throw new Error(
    'VITE_API_URL is not configured.',
  )
}

export class ApiError extends Error {
  readonly status: number

  readonly code:
    | string
    | null

  constructor(
    status: number,
    message: string,
    code: string | null = null,
  ) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ApiErrorResponse {
  error?: {
    code?: string
    message?: string
  }
}

interface RefreshResponse {
  accessToken: string
}

let refreshPromise:
  | Promise<boolean>
  | null = null

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise =
    performRefresh()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function performRefresh():
  Promise<boolean> {
  try {
    const response =
      await fetch(
        `${apiUrl}/auth/refresh`,
        {
          method: 'POST',

          credentials:
            'include',

          headers: {
            Accept:
              'application/json',
          },
        },
      )

    if (!response.ok) {
      clearAccessToken()

      notifySessionExpired()

      return false
    }

    const data =
      (await response.json()) as RefreshResponse

    setAccessToken(
      data.accessToken,
    )

    return true
  } catch {
    clearAccessToken()

    notifySessionExpired()

    return false
  }
}

function buildHeaders(
  options?: RequestInit,
) {
  const headers =
    new Headers(
      options?.headers,
    )

  headers.set(
    'Accept',
    'application/json',
  )

  const token =
    getAccessToken()

  if (
    token &&
    !headers.has(
      'Authorization',
    )
  ) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    )
  }

  return headers
}

async function executeRequest(
  path: string,
  options?: RequestInit,
) {
  return fetch(
    `${apiUrl}${path}`,
    {
      ...options,

      credentials:
        'include',

      headers:
        buildHeaders(
          options,
        ),
    },
  )
}

async function parseError(
  response: Response,
) {
  let message =
    'Não foi possível concluir a requisição.'

  let code:
    | string
    | null = null

  try {
    const body =
      (await response.json()) as ApiErrorResponse

    if (
      body.error?.message
    ) {
      message =
        body.error.message
    }

    if (
      body.error?.code
    ) {
      code =
        body.error.code
    }
  } catch {
    // Mantém os valores padrão.
  }

  return {
    message,
    code,
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const tokenBeforeRequest =
    getAccessToken()

  let response =
    await executeRequest(
      path,
      options,
    )

  const canTryRefresh =
    response.status === 401 &&
    Boolean(tokenBeforeRequest) &&
    path !== '/auth/login' &&
    path !== '/auth/refresh'

  if (canTryRefresh) {
    const refreshed =
      await refreshAccessToken()

    if (refreshed) {
      response =
        await executeRequest(
          path,
          options,
        )
    }
  }

  if (!response.ok) {
    const {
      message,
      code,
    } =
      await parseError(
        response,
      )

    throw new ApiError(
      response.status,
      message,
      code,
    )
  }

  if (
    response.status === 204
  ) {
    return undefined as T
  }

  return response.json() as Promise<T>
}