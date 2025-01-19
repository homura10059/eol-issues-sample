import type { Result } from './results.ts'

type EndOfLifeResponse = {
  cycle: string
  releaseDate: string
  eol: string | true
  latest: string
  latestReleaseDate: string
  lts: string | false
  extendedSupport: string | false
}

type EndOfLifeInfo = {
  product: string
  cycle: string
  startDate: string
  targetDate: string
}

export const fetchProductEOL = async (
  product: string
): Promise<Result<EndOfLifeInfo[]>> => {
  const url = `https://endoflife.date/api/${product}.json`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return {
        ok: false,
        error: new Error(`Failed to fetch data: ${response.statusText}`)
      }
    }

    const data: EndOfLifeResponse[] = await response.json()
    return {
      ok: true,
      value: data.map(data => intoEndOfLifeInfo(product, data))
    }
  } catch (error) {
    return { ok: false, error }
  }
}

const intoEndOfLifeInfo = (
  product: string,
  data: EndOfLifeResponse
): EndOfLifeInfo => {
  return {
    product,
    cycle: data.cycle,
    startDate: getLatestDate(data.releaseDate, data.lts),
    targetDate: data.eol ? data.latestReleaseDate : data.eol
  }
}

const getLatestDate = (date1: string, date2: string | false): string => {
  if (date2 === false) return date1
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return d1 > d2 ? date1 : date2
}
