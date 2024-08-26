import { gql } from "graphql-modules";

export const FeeType = gql`
type Fee  {
    note:String
    amount:Int
    date: String
    user:User
    id: String
}

input NewFeeInput {
    amount: Int
    date: String
    note: String
  }
  input UpdateFeeInput {
    id:String
    amount: Int
    date: String
    note: String
  }
  type Query {
    fee(id: ID!): Fee
    fees(
      user: ID
      startTime: String
      endTime: String
    ): [Fee]
  }
  type Mutation {
    createFee(input: NewFeeInput!): Fee
    updateFee(input: UpdateFeeInput!): Fee
    deleteFee(id: ID!): String
  }
`
