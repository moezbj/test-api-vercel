import { gql } from 'graphql-modules'

export const User = gql`
  type Query {
    user(token: String!): User
  }
  type User {
    id: String
    firstName: String
    lastName: String
    email: String
  }
`
