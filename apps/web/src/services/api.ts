const apiUrl =
  import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error(
    'VITE_API_URL is not configured.',
  )
}

export class ApiError extends Error {
  readonly status: number

  constructor(
    status: number,
    message: string,
  ) {
    super(message)

    this.name = 'ApiError'
    this.status = status
  }
}

interface ApiErrorResponse {
  error?: {
    code?: string
    message?: string
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${apiUrl}${path}`,
    {
      ...options,

      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    },
  )

  if (!response.ok) {
    let message =
      'Não foi possível concluir a requisição.'

    try {
      const body =
        (await response.json()) as ApiErrorResponse

      if (body.error?.message) {
        message =
          body.error.message
      }
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new ApiError(
      response.status,
      message,
    )
  }

  return response.json() as Promise<T>
}