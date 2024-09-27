import { gql } from "graphql-modules";

export const AuthType = gql`
  type Mutation {
    login(password: String!, email: String!): LoginResponse
    register(
      password: String!
      email: String!
      firstName: String!
      lastName: String!
      withResoures: Boolean
      taxRegistration: String!
    ): LoginResponse
    logout(token: String): String
    forgotPassword(email: String): String
    resetPassword(password: String, confirm: String, token: String): String
    updateLanguages(lang: LANGUAGE_TYPE_INPUT): String
    updateCountry(country: String, currency: CurrencyInput): User
    updateWork(
      startWork: String
      endWork: String
      slotDuration: String
    ): updateWorkResponse
    logout(token: String): String
    forgotPassword(email: String): String
    resetPassword(password: String, confirm: String, token: String): String
    refreshToken(refreshToken: String, userId: String): LoginResponse

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
  type updateWorkResponse {
    startWork: String
    endWork: String
    slotDuration: String
  }
  enum LANGUAGE_TYPE_INPUT {
    fr
    en
    ar
  }

  input CurrencyInput {
    name: String
    native: String
    symbol: String
  }
`;
