import { gql } from "graphql-modules";

export const User = gql`
  type Query {
    user(token: String!): User
    users: [User]
  }
  type Mutation {
    toggleUserStatus(id: String): User
  }
  type User {
    id: String
    firstName: String
    lastName: String
    email: String
    language: LANGUAGE_TYPE_USER
    startWork: String
    endWork: String
    slotDuration: String
    withResources: Boolean
    freeTrailAcount: Boolean
    taxRegistration: String
    country: String
    currency: TypeCurrency
    createdAt: String
    updatedAt: String
  }
  enum LANGUAGE_TYPE_USER {
    fr
    en
    ar
  }
  type TypeCurrency {
    name: String
    native: String
    symbol: String
  }
`;
