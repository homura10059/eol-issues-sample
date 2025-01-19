// #!/usr/bin/env pnpm run ts
import { graphql } from '@octokit/graphql'
import type { GraphQlQueryResponseData } from '@octokit/graphql'
import { fetchProductEOL } from './endoflife.ts'
import { createIssue, fetchAllIssues } from './github.ts'

const repository_id = ''

const updateEolIssuesByProduct = async (product: string) => {
  const eol_res = await fetchProductEOL(product)
  if (!eol_res.ok) {
    console.error(eol_res.error)
    return
  }

  const eolInfos = eol_res.value
  if (eolInfos.length === 0) {
    console.log(`No EOL information found for ${product}`)
    return
  }
  console.log(eolInfos)

  const issues_res = await fetchAllIssues(
    'homura10059',
    'eol-issues-sample',
    product
  )
  if (!issues_res.ok) {
    console.error(issues_res.error)
    return
  }

  const issues = issues_res.value
  console.log(issues)
}

const main = async () => {
  const products = ['nodejs']
  const results = await Promise.all(products.map(updateEolIssuesByProduct))
}

main()
