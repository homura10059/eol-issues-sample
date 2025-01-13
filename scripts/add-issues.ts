// #!/usr/bin/env pnpm run ts
import { graphql } from '@octokit/graphql'
import type { GraphQlQueryResponseData } from '@octokit/graphql'
import { fetchProductEOL } from './endoflife.ts'

const repository_id = ''

const main = async () => {
  const products = ['nodejs']
  // https://endoflife.date/api/{product}.json を引いてデータとってくる
  const results = await Promise.all(
    products.map(product => fetchProductEOL(product))
  )
  const flatResults = results
    .filter(result => result.ok)
    .flatMap(result => result.value)
  console.log(flatResults)

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  })

  // TODO: eol情報の取得
  // TODO: repositoryのissueを取得
  const { repository }: GraphQlQueryResponseData = await graphqlWithAuth(
    `{
    repository(owner: "homura10059", name: "eol-issues-sample") {
      issues(last: 3) {
        edges {
          node {
            title
          }
        }
      }
    }
  }`
  )

  console.log(repository)
}

main()
