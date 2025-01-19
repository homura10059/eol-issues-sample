import { graphql } from '@octokit/graphql'
import type { GraphQlQueryResponseData } from '@octokit/graphql'
import type { Result } from './results.ts'

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

export const createIssue = async (
  owner: string,
  repo: string,
  title: string,
  body: string
) => {
  const { repository }: GraphQlQueryResponseData = await graphqlWithAuth(
    `query SearchIssueByTitle($owner: String!, $repo: String!, $title: String!) {
      repository(owner: $owner, name: $repo) {
        issues(first: 1, filterBy: {labels: [], states: OPEN}, query: $title) {
          nodes {
            id
            title
            url
          }
        }
      }
    }`,
    {
      owner,
      repo,
      title
    }
  )
  console.log(repository)
}

type SearchIssueByLabelResponse = {
  repository: {
    issues: {
      nodes: {
        id: string
        title: string
        __typename: string
      }[]
      pageInfo: {
        hasNextPage: boolean
        endCursor: string
      }
    }
  }
}

export const fetchAllIssues = async (
  owner: string,
  repo: string,
  product: string,
  endCursor?: string
): Promise<Result<{ id: string; title: string }[]>> => {
  const {
    repository: {
      issues: { nodes, pageInfo }
    }
  }: SearchIssueByLabelResponse = await graphqlWithAuth(
    `query SearchIssueByLabel($owner: String!, $repo: String!, $labels: [String!]!, $after: String) {
      repository(owner: $owner, name: $repo) {
        issues(first:1, filterBy: {labels: $labels}, after: $after) {
          nodes {
            id
            title
            __typename
          } 
          pageInfo {
            hasNextPage
            endCursor
          } 
        }
      }
    }`,
    {
      owner,
      repo,
      labels: [`product:${product}`],
      endCursor
    }
  )
  const issues_info = nodes
    .filter(node => node.__typename === 'Issue')
    .map(({ id, title }) => ({ id, title }))

  const next = pageInfo.hasNextPage
    ? await fetchAllIssues(owner, repo, product, pageInfo.endCursor)
    : {
        ok: true,
        value: []
      }

  if (next.ok) {
    return {
      ok: true,
      value: [...issues_info, ...next.value]
    }
  }

  return {
    ok: true,
    value: issues_info
  }
}
