import { gql } from "graphql-modules";

export const User = gql`
  type Query {
    user(token: String!): User
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
    withResoures:Boolean
    freeTrailAcount:Boolean
  }
  enum LANGUAGE_TYPE_USER {
    fr
    en
    ar
  }
`;
