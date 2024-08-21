import { gql } from 'graphql-modules'

export const AuthType = gql`
  type Mutation {
    login(password: String!, email: String!): LoginResponse
    register(
      password: String!
      email: String!
      firstName: String!
      lastName: String!
    ): LoginResponse
    logout(token: String): String
    forgotPassword(email: String): String
    resetPassword(password: String, confirm: String, token: String): String
  }

  type Auth {
    email: String
    password: String
  }
  type Token {
    tokenType: String
    accessToken: String
    refreshToken: String
    expiresIn: String
  }
  type LoginResponse {
    user: User
    token: Token
  }
`
