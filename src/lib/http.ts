type ResponseParser<T> = (response: Response) => Promise<T>

const parseJson = <T>(response: Response) => response.json() as Promise<T>
const parseText = (response: Response) => response.text() as Promise<unknown>

export async function handleResponse<T = unknown>(
  response: Response,
  parser: ResponseParser<T> = parseJson<T>
): Promise<T> {
  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || fallbackMessage)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (parser === parseJson && !contentType.includes('application/json')) {
    return parseText(response) as Promise<T>
  }

  return parser(response)
}

export function handleEmptyResponse(response: Response): Promise<void> {
  return handleResponse<void>(response, async () => {
    await response.arrayBuffer()
  })
}
