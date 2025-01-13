import type { Result } from './results.ts'

type EndOfLifeInfo = {
  cycle: string
  releaseDate: string
  eol: string
  latest: string
  latestReleaseDate: string
  lts: string | false
  extendedSupport: string | false
}

export async function fetchProductEOL(
  product: string
): Promise<Result<EndOfLifeInfo[]>> {
  const url = `https://endoflife.date/api/${product}.json`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return {
        ok: false,
        error: new Error(`Failed to fetch data: ${response.statusText}`)
      }
    }

    const data: EndOfLifeInfo[] = await response.json()
    return { ok: true, value: data }
  } catch (error) {
    return { ok: false, error }
  }
}
