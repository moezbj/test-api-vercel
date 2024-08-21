import { gql } from 'graphql-modules'

export const TokenType = gql`
  type Query {
    validToken(
      tokenType: String!
      token: String!
      userId: String!
    ): LoginResponse
  }
`
